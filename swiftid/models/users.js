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

/* Data access for users using NeDB. */
var db = require('../database').users

/**
 * Load a user by id
 * @param  {string}   userId The id of the user to find.
 * @param  {Function} callback See NeDB docs.
 */

exports.findById = function (userId, callback) {
  db.findOne({ _id: userId }, callback)
}

/**
 * Load a user by username
 * @param  {string}   username The username of the user to find.
 * @param  {Function} callback See NeDB docs.
 */
exports.findByUsername = function (username, callback) {
  db.findOne({ username: username }, callback)
}

/**
 * Update a user's access token.
 * @param  {string}   userId      The user to update.
 * @param  {string}   accessToken The new access tokenURL
 * @param  {Function} callback    See NeDB docs.
 */
exports.updateAccessToken = function (userId, accessToken, callback) {
  db.update({ _id: userId }, { $set: { accessToken: accessToken } }, {}, function (err, updateCount) {
    if (err) { return callback(err) }
    callback(null, accessToken)
  })
}
