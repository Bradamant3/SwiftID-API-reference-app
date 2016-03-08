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
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var flash = require('connect-flash')
var helmet = require('helmet')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var users = require('./models/users')
var config = require('./config')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// Set up logging
var logLevel = process.env.SID_LOG_LEVEL
if (!logLevel) {
  if (app.get('env') === 'development') {
    logLevel = 'dev'
  } else {
    logLevel = 'common'
  }
}
app.use(logger(logLevel))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())
app.use(helmet())

// Setup Passport for authentication
passport.use(new LocalStrategy(
  function (username, password, done) {
    users.findByUsername(username, function (err, user) {
      if (err) { return done(err) }
      if (!user) {
        return done(null, false, { message: 'Incorrect username' })
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password' })
      }
      return done(null, user)
    })
  }
))
passport.serializeUser(function (user, done) {
  done(null, user._id)
})

passport.deserializeUser(function (id, done) {
  users.findById(id, function (err, user) {
    done(err, user)
  })
})
// The default session store is in-memory, so users will need to
// re-authenticate every time the app is started.
app.use(session({
  secret: 'keyboard cat',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// Always include user in locals that will be passed to views.
app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})

// Setup webhook confirmation middleware
app.use(require('./middlewares/webhook'))

// Setup routes
app.use(require('./routes')(config))


// Setup error handlers
app.use(require('./middlewares/errors'))

module.exports = app
