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
var passport = require('passport')
var csrf = require('csurf')
var users = require('../models/users')

var csrfProtection = csrf({ cookie: true })

router.get('/login', csrfProtection, function (req, res, next) {
  res.render('login', {
    csrfToken: req.csrfToken(),
    error: req.flash('error')
  })
})

router.post('/login',
  csrfProtection,
  passport.authenticate('local', { successRedirect: '/photos',
    failureRedirect: '/login',
  failureFlash: true })
)

router.post('/logout', function (req, res) {
  req.logout()
  res.redirect('/login')
})

module.exports = router
