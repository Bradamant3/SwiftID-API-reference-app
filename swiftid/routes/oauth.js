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
var debug = require('debug')('swiftid:oauth')

var isAuthenticated = require('../middlewares/authentication')

module.exports = function (options) {
  var router = express.Router()
  var oauth = require('../oauth')(options)

  /**
   * Begin the oauth process by redirecting the user to COF
   */
  router.get('/', isAuthenticated, function (req, res, next) {
    // TODO: check whether the user actually needs oauth
    res.redirect(301, oauth.getRedirectUrl())
  })

  /**
   * Expose a callback for COF to redirect back with an authorization code
   */
  router.get('/callback', isAuthenticated, function (req, res, next) {
    var code = req.query['authorizationCode']
    debug('Received authorization code: ' + code)
    oauth.getAccessToken(code, req.user._id, function (err) {
      if (err) { return next(err) }
      res.redirect('/')
    })
  })

  return router
}
