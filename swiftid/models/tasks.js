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

/**
 * Data access for tasks using NeDB.
 * A task is a request for SwiftID for access to a photo.
 */
var db = require('../database').tasks

/**
 * @callback findTaskCallback
 * @param {object}          err      Information about any error that occurred. undefined if no error.
 * @param {object|object[]} task(s) The task or tasks found. null or empty array if none found.
 */

/**
 * Create a task. The new task will have a status of OPEN. Other valid values
 * are APPROVED AND REJECTED.
 * @param  {object}   taskResponse The response from the request to SwiftID to create the task.
 * @param  {string}   requestorId  The user who requested the access to the photo.
 * @param  {string}   photoId      The photo being requested access to.
 * @param  {Function} callback     See NeDB docs.
 */
exports.create = function (taskResponse, requestorId, photoId, callback) {
  var task = {
    _id: taskResponse.taskReferenceId,
    responseStatus: taskResponse.status,
    responseDescription: taskResponse.description,
    expirationTimestamp: taskResponse.taskExpirationTimestamp,
    requestorId: requestorId,
    photoId: photoId,
    status: 'OPEN'
  }
  db.insert(task, callback)
}

/**
 * Find a task by id.
 * @param {string}           id       The id of the task to find.
 * @param {findTaskCallback} callback Handle the response from NeDB
 */
exports.findById = function (id, callback) {
  db.findOne({ _id: id }, callback)
}

/**
 * Load all tasks for a specific requestor
 * @param {string}           requestorId The requestor of the task.
 * @param {findTaskCallback} callback    Handle the response from NeDB
 */
exports.findByRequestorId = function (requestorId, callback) {
  db.find({ requestorId: requestorId }, callback)
}

/**
 * Load a task for a specific photo and requestor, if any
 * @param {string}           photoId     The id of the photo.
 * @param {string}           requestorId The requestor of the task.
 * @param {findTaskCallback} callback    Handle the response from NeDB
 */
exports.findForPhoto = function (photoId, requestorId, callback) {
  db.findOne({ requestorId: requestorId, photoId: photoId }, callback)
}

/**
 * Update a task
 * @param  {string}   id        The id of the task to update
 * @param  {object}   newValues A set of modifiers to use with $set
 * @param  {Function} callback  See NeDB docs
 */
exports.updateValues = function (id, newValues, callback) {
  db.update({ _id: id }, { $set: newValues }, callback)
}
