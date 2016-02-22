/*
Copyright 2016 Capital One Services, LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* All photo-related routes. */

var express = require('express');
var passport = require('passport');
var _ = require('lodash');
var debug = require('debug')('swiftid:photos');
var photos = require('../models/photos');
var users = require('../models/users');
var tasks = require('../models/tasks');
var isAuthenticated = require('../middlewares/authentication');
var oauth = require('../oauth');
var SwiftIdClient = require('../swiftid/swiftIdClient');

module.exports = function(options) {
  var router = express.Router();
  var client = new SwiftIdClient(options.client, oauth(options.oauth));

  router.use(isAuthenticated);

  /**
   * List out all photos the current user has uploaded and photos uploaded
   * by other users.
   */
  router.get('/', function(req, res, next) {
    var userId = req.user._id;
    // Load all the current user's photos.
    photos.findByOwnerId(userId, function(ownerErr, ownedPhotos) {
      if(ownerErr) { return next(ownerErr); }

      // Load photos owned by other users
      // NOTE: In production, some filtering/pagination should be performed
      photos.findOtherPhotos(userId, function(sharedErr, otherPhotos) {
        if(sharedErr) { return next(sharedErr); }

        // Load tasks in order to display access status per photo
        tasks.findByRequestorId(userId, function(taskErr, tasks){
          if(taskErr) { return next(taskErr); }

          var viewModel = {
            ownedPhotos: photoViewModels(ownedPhotos, null),
            otherPhotos: photoViewModels(otherPhotos, tasks)
          };
          res.render('photos/index', viewModel);
        });
      });
    });
  });

  /**
   * Load details for a single photo.
   */
  router.get('/:photoId', function(req, res, next) {
    photos.findById(req.params.photoId, function(photoErr, photo) {
      if(photoErr) { return next(photoErr); }

      // If the photo has a task for this user, load it and add it to the view model
      tasks.findForPhoto(req.params.photoId, req.user._id, function(taskErr, task){
        if(taskErr) { return next(taskErr); }
        res.render('photos/display', {
          photo: photoViewModel(photo, task),
          canAccessHighRes: canAccessHighRes(photo, req.user)
        });
      });
    });
  });

  /**
   * Update the proteced status of a photo.
   */
  router.post('/:photoId/isProtected', function(req, res, next){
    var isProtected = req.body.isProtected === 'true';
    photos.updateValues(req.params.photoId, { isProtected: isProtected }, function(err){
      if(err) return next(err);
      res.redirect('/photos');
    });
  });

  var sendFileOptions = {
    root: __dirname + '/../photos/',
  };
  /**
   * Get a photo's thumbnail image.
   */
  router.get('/:photoId/thumbnail', function(req, res, next) {
    photos.findById(req.params.photoId, function(err, photo) {
      if(err) { return next(err); }
      res.sendFile(photo.thumbnail, sendFileOptions);
    });
  });

  /**
   * Get a photo's low-res image.
   */
  router.get('/:photoId/lowRes', function(req, res, next) {
    photos.findById(req.params.photoId, function(err, photo) {
      if(err) { return next(err); }
      res.sendFile(photo.lowResolution, sendFileOptions);
    });
  });

  /**
   * Get a photo's high-res image if the user has access to it.
   */
  router.get('/:photoId/highRes', function(req, res, next) {
    photos.findById(req.params.photoId, function(err, photo) {
      if(err) { return next(err); }

      if(canAccessHighRes(photo, req.user)) {
        res.sendFile(photo.highResolution, sendFileOptions);
      }
      else {
        res.status(401).send('Unauthorized');
      }
    });
  });

  /**
   * Get a page to request access to a protected photo.
   */
  router.get('/:photoId/requestAccess', function(req, res, next) {
    photos.findById(req.params.photoId, function(err, photo) {
      if(err) { return next(err); }
      res.render('photos/requestAccess', { photo: photo });
    });
  });

  /**
   * Call the SwiftID API to request access to the high-res version of a photo.
   */
  router.post('/:photoId/requestAccess', function(req, res, next) {
    photos.findById(req.params.photoId, function(photoErr, photo) {
      if(photoErr) { return next(photoErr); }
      var message = {
        clientApp: 'PhotoShed',
        action: 'view your high-res photo, ' + photo.name,
        requestorName: req.user.username
      };

      // Make the SwiftID API call to request access to the photo.
      client.createTask(photo.owner._id, message, function(remoteTaskErr, taskResponse) {
        if(remoteTaskErr) { return next(remoteTaskErr); }

        // Persist information about the task locally so we can match
        // when the webhook is called.
        tasks.create(taskResponse, req.user._id, photo._id, function(localTaskErr) {
          res.redirect('/photos');
        });
      });
    });
  });

  /**
   * Match photos to tasks and create a view model for each pair.
   * @param  {object} photos
   * @param  {object} tasks
   * @return {object[]}      The new view models.
   */
  function photoViewModels(photos, tasks) {
    if(tasks){
      // Pair up photos with their task (if any) and construct view models
      var tasksByPhotoId = _.keyBy(tasks, 'photoId');
      return photos.map(function(photo) {
        return photoViewModel(photo, tasksByPhotoId[photo._id]);
      });
    } else {
      return photos.map(function(photo) {
        return photoViewModel(photo, null);
      });
    }
  }

  function photoViewModel(photo, task) {
    var additionalFields = {};
    if(task){
      additionalFields.taskStatus = task.status;
    } else {
      additionalFields.taskStatus = null;
    }
    var viewModel = _.assign({}, photo, additionalFields);
    return viewModel;
  }

  /**
   * Protected photos can only be viewed by the owner and user's
   * the photo has been shared with.
   */
  function canAccessHighRes(photo, user) {

    var isOwner = photo.owner._id === user._id;
    var isSharedWith = _.includes(photo.sharedWith, user._id );
    return !photo.isProtected ||
           (photo.isProtected && (isOwner || isSharedWith));
  }

  return router;
};
