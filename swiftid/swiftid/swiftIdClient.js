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

/** Provides access to the SwiftID API */
var _ = require('lodash');
var request = require('request');
var debug = require('debug')('swiftid:api-client');
var format = require('util').format;

// Default to a secure call to the API endpoint
var defaultOptions = {
  // TODO: update this value with actual/staging api host
  url: 'https://api.capitalone.com/identity',
  apiVersion: 1
};

/**
 * The API client class
 * @param options {object} Client options (host url, API version)
 * @param oauthOptions {object} An OAuth handler
 */
function SwiftIdClient(options, oauth) {
  if(!this instanceof SwiftIdClient) {
    return new SwiftIdClient(options, oauth);
  }

  // Store the supplied options, using default values if not specified
  this.options = _.defaults({}, options, defaultOptions);
  this.oauth = oauth;
};
module.exports = SwiftIdClient;

/**
 * Create an Enhanced Authentication task (aka SwiftID).
 * @param accessToken The ID of the user whose resource we are attempting to access
 * @param message A MessageInfo object containing clientApp, action, and
 * requestor name. This information will appear in the notification sent to the
 * user.
 * @param callback {function} A callback accepting (error, taskResponse)
 */
SwiftIdClient.prototype.createTask = function(ownerId, message, callback){
  var client = this;
  this.oauth.withToken(ownerId, function(err, token){
    if(err) { return callback(err); }

    // Set up the options to pass to the POST Request
    // Make sure that the Content-Type is json so that we can pass a json body.
    var reqOptions = {
      baseUrl: client.options.url,
      url: '/identity/enhanced-authentication/tasks',
      method: 'POST',
      headers: {
        'Accept': 'application/json; v=' + client.options.apiVersion
      },
      auth: {
        bearer: token.access_token
      },
      json: true,
      body: message
    };

    debug('Creating SwiftID task', reqOptions);
    client._sendRequest(reqOptions, callback);
  });
};

/**
 * A private function to send a request to the API and parse the response, handling errors as needed
 */
SwiftIdClient.prototype._sendRequest = function _sendRequest(reqOptions, callback) {
  request(reqOptions, function(err, response, body){
    if(err) { return callback(err); }
    if(response.statusCode >= 400) {
      return processResponseErrors(body, callback);
    } else if(response.statusCode >= 200) {
      debug('Received response', body);
      return callback(null, body);
    } else {
      console.error('Received unexpected status code: ' + response.statusCode);
      return callback(new Error(''));
    }
  });
};

function processResponseErrors(responseBody, callback) {
  if(!responseBody) {
    return callback(new Error('The request failed with no error details returned'));
  }

  var errorCode = responseBody.code || '<no code>';
  var errorDescription = responseBody.description || '<no description>';
  var documentationUrl = responseBody.documentationUrl || '<no URL>';
  var message = format('Received an error from the API: code=%s | description=%s | documentation=%s', errorCode, errorDescription, documentationUrl);
  console.error(message);
  callback(new Error(message));
}
