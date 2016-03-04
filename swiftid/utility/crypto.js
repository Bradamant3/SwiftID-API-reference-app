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
 * Simple encryption/decryption using AES 256
 */

var crypto = require('crypto')
var algorithm = 'aes-256-ctr'
var key = require('../config').cryptoKey

/**
 * Globally set the key for this module
 */
exports.useKey = function useKey (newKey) {
  key = newKey
}

exports.encrypt = function encrypt (value) {
  var cipher = crypto.createCipher(algorithm, key)
  var encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}

exports.decrypt = function decrypt (value) {
  var decipher = crypto.createDecipher(algorithm, key)
  var decrypted = decipher.update(value, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
