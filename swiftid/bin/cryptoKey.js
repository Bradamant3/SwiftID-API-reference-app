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
 * Creates a key to use with the crypto module
 * NOTE: This is not intended to be run from within a running application
 */

var crypto = require('crypto')
console.log('Generating a new 256-bit key...')
console.log(crypto.randomBytes(32).toString('base64'))
