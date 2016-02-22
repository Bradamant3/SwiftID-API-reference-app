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

/* Register all routes. */

var express = require('express');
var isAuthenticated = require('../middlewares/authentication');

var users = require('./users');
var callbacks = require('./callbacks');
var photos = require('./photos');
var oauth = require('./oauth');

module.exports = function(options){
  var router = express.Router();

  router.use('/', users);
  router.use('/', callbacks(options.swiftid.oauth.clientID));
  router.use('/photos', photos(options.swiftid));
  router.use('/oauth', oauth(options.swiftid.oauth));
  router.get('/', isAuthenticated, function(req, res, next){
    res.redirect('/photos');
  });

  return router;
};
