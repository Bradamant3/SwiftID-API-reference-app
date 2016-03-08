SwiftID is an Identity service that provides secure authentication with Capital One SwiftID Customer’s mobile device.  SwiftID Customers can approve or deny a transaction request by a third party, independent of the SwiftID customer’s Capital One accounts or any other Capital One service.

## Software Requirements Including version
This is version 1.0 of the SwiftID API Reference Application Code. For software requirements, see Build/Install Instructions below.

This reference app highlights how to use SwiftID with an app called PhotoShed. Users can protect their photos so that only those they approve through SwiftID have access to the high resolution versions. If you encounter any issues using this reference code, please submit them in the form of GitHub issues.

## Build/Install Instructions
The only dependency that must be manually installed is [Node.js](https://nodejs.org) 4.X or higher. All other dependencies will be installed through [npm](https://www.npmjs.com/).

You can learn how to install Node.js on your platform at https://nodejs.org/en/download/.

### Create your developer account and test app
Sign up for a developer account at https://developer.capitalone.com/. Then, create your first app at https://developer.capitalone.com/app-registration/. After signing up, you will see your Client Id and Client Secret. You will need both of these for your config.js. Next, be sure to set your Redirect URI for OAuth. Finally, under "Connected API Products", add a product and select SwiftID.

### config.js
config.js contains information specific to your app, such as your client_id and client_secret. Create this file by copying [config.js.sample](/swiftid/config.js.sample). The sample version points to the sandbox environment at https://api-sandbox.capitalone.com/. Be careful not to put config.js into version control.

#### Generating an encryption key
This app uses the crypto module to encrypt/decrypt certain sensitive values.  You can generate a new encryption key by running the script in ./bin/cryptoKey.js from your node console (`node ./bin/cryptoKey.js` from within the swiftid directory), and pasting the resulting value into the `cryptoKey` section of your config.js file.

### Start PhotoShed
From the project root:  
`cd swiftid`  
`npm install`  
`npm start`

### Register a webhook with the SwiftID API
The app must have an endpoint registered with SwiftID to use as a webhook callback when a SwiftID request is approved or rejected. These curl commands will authenticate and register the webhook. In production this endpoint must be secured with HTTPS, but the sandbox environment does not require this.

**These commands only need to be run the first time you run the app**

POST your client credentials to the OAuth endpoint:
```
curl -X POST https://api-sandbox.capitalone.com/oauth/oauth20/token\
     -d 'client_id=<client_id>'\
     -d 'client_secret=<client_secret>'\
     -d 'grant_type=client_credentials'
```
The response will contain an access token:
```
HTTP/1.1 200 OK
Content-Type: application/json
    {
        "access_token" : "5354e3a56036056cffb5a99f368a31cef3aee2a8",
        "token_type" : "Bearer",
        "expires_in" : 1295999
    }
```

Register the webhook, passing in the access_token:
```
curl -i -k -tlsv1 -X POST https://api-sandbox.capitalone.com/identity/webhooks\
   -H "Content-Type: application/json"\
   -H "Accept: application/json; v=1"\
   -H "Authorization: Bearer <access_token>"\
   -d '{ "callbackUrl": "https://your.app.here:3000/photos/request-access-hook",
   "eventType": "EnhancedAuthentication" }'
```

### Log in as photo_owner
The app comes with two pre-registered users, photo_owner and photo_requestor. Start by navigating to http://localhost:3000/. You will see a login form. Login with the following credentials

Username: photo_owner  
Password: password

After logging in, you will be redirected to a page showing every photo the user owns and photos uploaded by other users.

![photo_owner dashboard](/docs/photo_owner_dashboard.png)

### Protect a photo
By default, any user can view the high resolution version of your uploaded photos. By authenticating with Capital One Financial SwiftID, we can restrict who has access to these photos. First, in the upper right corner, click "Not Protected by Capital One". This will start an OAuth flow asking for PhotoShed to connect to Capital One.

Once you have authorized, click a photo thumbnail. In the lower left of the modal window, click the unlocked icon. It will change into a lock. The high resolution version of this photo is now protected.

![photo_owner unprotected](/docs/photo_owner_unprotected.png)
![photo_owner protected](/docs/photo_owner_protected.png)

### Log out and log in as photo_requestor
Log out as photo_owner using the link in the upper right and log in again as photo_requestor using the following credentials

Username: photo_requestor  
Password: password

### Request access to the protected photo
When you log in this time, you should see the photo's listed in "Other People's Photos".

![photo_requestor dashboard](/docs/photo_requestor_dashboard.png)

The photo that was protected by photo_owner should have a lock icon in the upper right corner. Click that photo and click "Request Access To Full Resolution". Then click "Request" in the next modal. This triggers a SwiftID request to photo_owner.

![photo_requestor request access](/docs/photo_requestor_request_access.png)
![photo_requestor request modal](/docs/photo_requestor_request_modal.png)

### Approve the request
Go to the developer dashboard and view [your apps](https://developer.capitalone.com/my-account/). You need to drill down to the page that lists all SwiftID requests for your app. First, click on your app. Then, scroll down and click the "View Test Data" button. This will list out the test users for your app. You should also see a "Notifications" link. Click that and you should see a listing of all SwiftID requests for your app. Approve the open task.

![developer dashboard open request](/docs/developer_dashboard_open_request.png)

### Access the photo as photo_requestor
Switch back to http://localhost:3000/photos and refresh the page. You will see that lock icon has switched to unlocked. If you click the thumbnail, you will now see a "View Full Resolution" link. Click it to see the high resolution image.
n
![photo_requestor access granted](/docs/photo_requestor_granted.png)

### Viewing more details

To get a deeper look at the messages being passed, start the app with the following command `DEBUG=swiftid:* NODE_DEBUG=request npm start`.  This will activate detailed debug logging to the console, showing the details of the request to the API and the response received.

## Best Practices
This application makes use of the [helmet](https://www.npmjs.com/package/helmet) library for safer http headers, and the [csurf](https://www.npmjs.com/package/csurf) library to avoid cross-site request forgery attacks. However, when developing and hosting a real world application, make sure to be aware of the [security](http://expressjs.com/en/advanced/best-practice-security.html) and [performance](http://expressjs.com/en/advanced/best-practice-performance.html) best practices for the Express framework. In particular, session management should not be handled in-memory, passwords should always be hashed, and hosting with TLS is strongly recommended.  Free certificates can be acquired at https://letsencrypt.org/.

## Architecture
PhotoShed is a [Node.js](https://nodejs.org) 4.x and higher app built with [Express](http://expressjs.com/) 4.13.1. It uses [NeDB](https://github.com/louischatriot/nedb) 1.7.3 for the persistence layer and [Passport](http://passportjs.org/) for authentication.

One overarching goal was to allow the app to run on any machine that has Node.js installed with no other dependencies outside of npm. This led us to use NeDB for the persistence layer. NeDB is ideal because it has no binary dependency. Also, it stores data in human readable format, which is useful for a reference application.

NeDB does not support [promises](https://www.promisejs.org/), so there are portions of the code that have deeply nested callbacks. Since the application is small, this was considered an acceptable tradeoff versus bringing in a library to wrap NeDB calls in promises.

The Node.js https library is verbose and repetitive for our narrow use case, so we also used [request](https://github.com/request/request) for calls to the SwiftID API.

The application structure follows the pattern generated by the [Express application generator](http://expressjs.com/en/starter/generator.html) with some additional best practices from https://www.terlici.com/2014/08/25/best-practices-express-structure.html.

## Roadmap
This reference app code is intended as a starting place for developers who want to use the SwiftID API. As such, it will be updated with new functionality only when the SwiftID API is updated with new functionality.

## Contribution Guidelines
We encourage any contributions that align with the intent of this project and add more functionality or languages that other developers can make use of. To contribute to the project, please submit a PR for our review. Before contributing any source code, familiarize yourself with the Apache License 2.0 (license.md), which controls the licensing for this project.
