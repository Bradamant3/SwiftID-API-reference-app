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

var db = require('../database').tasks

exports.create = function (task, callback) {
  db.insert(task, function (err, newTask) {
    callback(err, newTask)
  })
}

exports.findAll = function (callback) {
  db.find({}, function (err, tasks) {
    callback(err, tasks)
  })
}

exports.findOpen = function (callback) {
  db.find({ status: 'OPEN' }, function (err, tasks) {
    callback(err, tasks)
  })
}

exports.findById = function (id, callback) {
  db.findOne({ _id: id }, function (err, task) {
    callback(err, task)
  })
}

exports.updateStatus = function (id, status, callback) {
  db.update({ _id: id }, { $set: { status: status } }, {}, function (err, numReplaced) {
    callback(err, numReplaced)
  })
}
