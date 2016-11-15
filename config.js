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
var oauthHost = 'https://api-sandbox.capitalone.com'
var swiftidHost = 'https://api-sandbox.capitalone.com'
// This is the publicly-accessible endpoint for your app
var appHost = process.env.SWIFTID_APP_HOST || 'http://localhost:3000'

module.exports = {
  swiftid: {
    client: {
      // The URL of the SwiftID environment you are connecting to.
      url: swiftidHost,
      apiVersion: 1
    },
    oauth: {
      authorizationURL: oauthHost + '/oauth2/authorize',
      tokenURL: oauthHost + '/oauth2/token',
      // The clientId and clientSecret you received when registering your app.
      clientID: process.env.SWIFTID_CLIENT_ID,
      clientSecret: process.env.SWIFTID_CLIENT_SECRET,
      redirectURI: appHost + '/oauth/callback',
      // Defines the range of time (in seconds) before the token's 'expires_in' value will cause a refresh
      // E.g. a value of 10 and an expires_in of 900 will cause a refresh after 890 seconds or more
      expirationThreshold: 60
    }
  },
  cryptoKey: process.env.SWIFTID_CRYPTO_KEY
}
