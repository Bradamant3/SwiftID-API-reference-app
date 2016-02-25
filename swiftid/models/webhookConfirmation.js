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

/*
 * Data access for webhook confirmations using NeDB.
 * The app assumes there is only webhook to confirm.
 */
var db = require('../database').webhookConfirmation

/*
 * Find the only webhookConfirmation.
 * @param  {Function} callback  See NeDB docs
 */
exports.findFirst = function (callback) {
  db.findOne({}, callback)
}

 /**
  * Mark the webhook as confirmed.
  * @param  {Function} callback  See NeDB docs
  */
 exports.confirm = function (callback) {
   db.update({}, { $set: { confirmed: true } }, callback)
 }
