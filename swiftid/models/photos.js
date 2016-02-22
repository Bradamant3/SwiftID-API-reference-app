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

/* Data access for photos using NeDB. */
var db = require('../database').photos;

/**
 * @callback findPhotoCallback
 * @param {object}          err      Information about any error that occurred. undefined if no error.
 * @param {object|object[]} photo(s) The photo or photos found. null or empty array if none found.
 */

/**
 * Find a photo by id.
 * @param {string}            id       The id of the photo to find.
 * @param {findPhotoCallback} callback Handle the response from NeDB
 */
exports.findById = function(id, callback) {
  db.findOne({ _id: id }, callback);
};

/**
 * Find all photos for an owner.
 * @param  {string}            ownerId  The userId of the photo owner.
 * @param  {findPhotoCallback} callback Handle the response from NeDB
 */
exports.findByOwnerId = function(ownerId, callback) {
  db.find({ 'owner._id': ownerId }, callback);
};

/**
 * Find all photos owned by other users.
 * @param  {string}            userId   Find all photos owned by users other than userId.
 * @param  {findPhotoCallback} callback Handle the response from NeDB
 */
exports.findOtherPhotos = function(userId, callback) {
  db.find({ 'owner._id': { $ne: userId } }, callback);
};

/**
 * Update a photo
 * @param  {string}   id        The id of the photo to update
 * @param  {object}   newValues A set of modifiers to use with $set
 * @param  {Function} callback  See NeDB docs
 */
exports.updateValues = function(id, newValues, callback) {
  db.update({ _id: id }, { $set: newValues }, callback);
};

/**
 * Add a user to the list of users the photo has been shared with.
 * @param  {string}   id       The id of the photo to add the user to.
 * @param  {string}   userId   The user to add to the photo.
 * @param  {Function} callback See NeDB docs
 */
exports.addSharedUserId = function(id, userId, callback) {
  db.update({ _id: id }, { $addToSet: { sharedWith: userId }}, callback);
}
