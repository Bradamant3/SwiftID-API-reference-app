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

var express = require('express');
var router = express.Router();
var passport = require('passport')
var users = require('../models/users');

/* GET registration page */
router.get('/register', function(req, res, next) {
  res.render('register', { error: req.flash('error')} );
});

/* POST registration page */
router.post('/register', function(req, res, next) {
  // Get username and password params.
  var username = req.body.username;
  var password = req.body.password;

  // Check if this user already exists.
  users.findByUsername(username, function(findErr, user) {
    if(findErr) { next(findErr); }
    if(user === null){
      users.create(username, password, function(userErr, newUser) {
        if(userErr) { return next(userErr); }

        // On creation, log in as the new user
        req.login(newUser, function(loginErr){
          if(loginErr){
            return next(loginErr);
          }
          res.redirect('/photos');
        });
      });
    }
    else {
      // The user already exists. Notify the user.
      req.flash('error', 'Username already taken')
      res.redirect('/register');
    }
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { error: req.flash('error') });
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/photos',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

router.post('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

module.exports = router;
