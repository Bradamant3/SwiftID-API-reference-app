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

var qs = require('querystring');
var request = require('request');
var users = require('../models/users');
var moment = require('moment');
var debug = require('debug')('swiftid:oauth');

/**
 * Provides functions for oauth token management
 */
module.exports = function(options) {
  var clientID = options.clientID;
  var clientSecret = options.clientSecret;
  var authorizationURL = options.authorizationURL;
  var tokenURL = options.tokenURL;
  // The URL for COF to call back to and send the authorization code
  var callbackURL = options.callbackURL;
  // Defines the range of time (in seconds) before the token's 'expires_in' value will cause a refresh
  // E.g. a value of 10 and an expires_in of 900 will cause a refresh after 890 seconds or more
  var expirationThreshold = options.expirationThreshold || 0;

  /**
   * Create a URL to initiate oauth flow
   */
  function getRedirectUrl(){
    var url = options.authorizationURL;
    var params = {
      'client_id': clientID,
      'redirect_uri': callbackURL,
      'scope': 'openid swiftid',
      'response_type': 'code'
    };
    var fullUrl = url + '?' + qs.stringify(params);
    debug('Generated OAuth URL: ' + fullUrl);
    return fullUrl;
  }

  /**
   * Exchange an authorization code for a new access token
   */
  function getAccessToken(authorizationCode, userId, callback) {
    debug('Received an authorization code, exchanging for an access token');
    var reqOptions = {
      url: tokenURL,
      method: 'POST',
      form: {
        'code': authorizationCode,
        'client_id': clientID,
        'client_secret': clientSecret,
        'redirect_uri': callbackURL,
        'grant_type': 'authorization_code'
      }
    };
    exchangeTokens(userId, reqOptions, callback);
  }

  /**
   * Get a fresh oauth token, either reusing a previous token or refreshing it
   */
  function withToken(userId, callback) {
    users.findById(userId, function(err, user){
      if(err) { return callback(err); }
      if(!user || !user.accessToken) {
        return callback(new Error('User does not have an access token'));
      }
      var token = user.accessToken;
      if(isTokenExpired(token)) {
        debug('Token is expired.  Exchanging for a new access token');
        return refreshToken(userId, token, callback);
      }

      callback(null, token);
    });
  }

  /**
   * Determine whether a token is expired and needs to be refreshed
   */
  function isTokenExpired(token) {
    var expirationSeconds = parseInt(token.expires_in) - expirationThreshold;
    var expiration = moment.unix(parseInt(token.received));
    expiration.add(expirationSeconds, 'seconds');

    debug('Token expires at ' + expiration.format() + ')');

    return moment().isSameOrAfter(expiration);
  }

  /**
   * Handle exchanging the refresh token for a new access token after the old one has expired
   */
  function refreshToken(userId, token, callback){
    var reqOptions = {
      url: tokenURL,
      method: 'POST',
      form: {
        'client_id': clientID,
        'client_secret': clientSecret,
        'grant_type': 'refresh_token',
        'redirect_uri': callbackURL,
        'refresh_token': token.refresh_token
      }
    };
    exchangeTokens(userId, reqOptions, callback);
  }

  /**
   * Get an access token from the server and store it for this user.
   * Used by both initial authorization and refresh logic
   */
  function exchangeTokens(userId, reqOptions, callback){
    debug('Initiating token exchange', reqOptions);

    request(reqOptions, function(error, response, body){
      if(error) {
        console.error('Failed to exchange authorization token for access token');
        return callback(error);
      }
      if(response.status >= 400){
        return callback(new Error('OAuth access token exchange failed'));
      }

      if(!body){
        var error = new Error('OAuth response body did not include an access token');
        console.error(error);
        return callback(error);
      }

      // Store the date/time the token was received
      var received = moment().unix();

      debug('Received token response', body);
      try {
        var newToken = JSON.parse(body);
      } catch(parseError){
        return callback(parseError);
      }
      debug('Parsed new token', newToken);

      newToken['received'] = received;
      // Save the token to the user
      users.updateAccessToken(userId, newToken, callback);
    });
  }

  return {
    getRedirectUrl: getRedirectUrl,
    getAccessToken: getAccessToken,
    withToken: withToken
  };
};
