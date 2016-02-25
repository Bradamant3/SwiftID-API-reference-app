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

var express = require('express')
var router = express.Router()
var moment = require('moment')
var request = require('request')
var webhooks = require('../models/webhooks')
var tasks = require('../models/tasks')

/* GET home page. */
router.get('/', function (req, res, next) {
  // List all the tasks with buttons to approve or reject them.
  tasks.findOpen(function (err, tasks) {
    res.render('index', { tasks: tasks })
  })
})

router.post('/:taskId/approve', function (req, res, next) {
  processStatusChange(req.params.taskId, 'APPROVED', function () {
    res.redirect('/')
  })
})

router.post('/:taskId/reject', function (req, res, next) {
  processStatusChange(req.params.taskId, 'REJECTED', function () {
    res.redirect('/')
  })
})

function processStatusChange (taskId, newStatus, callback) {
  tasks.findById(taskId, function (err, task) {
    tasks.updateStatus(taskId, newStatus, function (err, numReplaced) {
      // Assume there is only one webhook.
      webhooks.findFirst(function (err, webhook) {
        callWebhook(newStatus, webhook, task, callback)
      })
    })
  })
}

function callWebhook (status, webhook, task, callback) {
  // Assume there are no "header_" params
  var options = {
    url: webhook.callbackUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'webhookValidationId': task.webhookValidationId
    },
    json: true,
    body: {
      taskStatus: status,
      taskReferenceId: task._id
    }
  }

  console.log(JSON.stringify(options))
  request(options, function (err, response, body) {
    callback()
  })
}

function confirmWebhook(webhook, callback) {
  var options = {
    url: webhook.callbackUrl,
    method: 'POST',
    headers: {
      'webhookValidationId': "true"
    }
  }

  console.log(JSON.stringify(options))
  request(options, function (err, response, body) {
    callback()
  })
}

router.post('/identity/enhanced-authentication/tasks', function (req, res, next) {
  var task = {
    webhookValidationId: req.get('webhookValidationId'),
    message: req.body,
    accessToken: req.get('Authorization'), // Includes Bearer. Not worried about parsing that out right now.
    status: 'OPEN', // open, approved, rejected, expired
    expirationTimestamp: moment().add(20, 'minutes').format() // expires in twenty minutes
  }

  // Save the task1
  tasks.create(task, function (err, newTask) {
    // Assume success. Return a 201 with a code of 203001 in the repsonse
    var responseBody = {
      taskReferenceId: newTask._id,
      taskExpirationTimestamp: newTask.expirationTimestamp,
      code: '203001',
      description: "The notification was created and sent to your customer's device."
    }
    res.status(201).json(responseBody)
  })

})

router.post('/identity/webhooks', function (req, res, next) {
  // Assume that these values are valid.
  var clientId = req.body.clientId
  var clientSecret = req.body.clientSecret

  var webhook = {
    callbackUrl: req.body.callbackUrl,
    eventType: req.body.eventType
  }

  webhooks.create(webhook, function (err, newWebhook) {
    confirmWebhook(newWebhook, function() {
      var responseBody = {
        webhookId: newWebhook._id,
        callbackUrl: newWebhook.callbackUrl,
        eventType: newWebhook.eventType
      }
      res.status(201).json(responseBody)
    })
  })
})

module.exports = router
