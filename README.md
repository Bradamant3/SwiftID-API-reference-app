# SwiftID API Reference App

SwiftID is an Identity service that provides secure authentication with Capital One SwiftID Customer’s mobile device.  SwiftID Customers can approve or deny a transaction request by a third party, independent of the SwiftID customer’s Capital One accounts or any other Capital One service.

## Software Requirements Including version
This is version 1.0 of the SwiftID API Reference Application Code. For software requirements, see Build/Install Instructions below.

This reference app highlights how to use SwiftID with an app called PhotoShed. Users can protect their photos so that only those they approve through SwiftID have access to the high resolution versions. If you encounter any issues using this reference code, please submit them in the form of GitHub issues.

## Build/Install Instructions

### config.js
You can configure your clientID and clientSecret in swiftid/config.js. In addition, if you change the default port for the mock API, you also need to update this file.

### Start the mock API
From the project root:  
`cd swiftid_mock_api`  
`npm install`  
`npm start`

### Register a webhook with the mock API
By default, the mock API runs on port 3001. This curl command will register a webhook that will be called when a SwiftID request is approved or rejected. This command only needs to be run the first time you run the app.

`curl -H "Content-Type: application/json" -X POST -d '{ "clientId": "123456", "clientSecret": "abcdef", "callbackUrl": "http://localhost:3000/photos/request-access-hook", "eventType": "ENHANCEDAUTHENTICATION" }' http://localhost:3001/identity/webhooks`

### Start PhotoShed
From the project root:  
`cd swiftid`  
`npm install`  
`npm start`

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
Switch over to the mock API dashboard http://localhost:3001/. This will list out all open SwiftID requests. Go ahead and approve the request.

![mock API open request](/docs/mock_api_open_request.png)

### Access the photo as photo_requestor
Switch back to http://localhost:3000/photos and refresh the page. You will see that lock icon has switched to unlocked. If you click the thumbnail, you will now see a "View Full Resolution" link. Click it to see the high resolution image.

![photo_requestor access granted](/docs/photo_requestor_granted.png)

### Viewing more details

To get a deeper look at the messages being passed, start the app with the following command `DEBUG=swiftid:* NODE_DEBUG=request npm start`.  This will activate detailed debug logging to the console, showing the details of the request to the API and the response received.

## Architecture

## Roadmap
This reference app code is intended as a starting place for developers who want to use the SwiftID API. As such, it will be updated with new functionality only when the SwiftID API is updated with new functionality.

## Contribution Guidelines
We encourage any contributions that align with the intent of this project and add more functionality or languages that other developers can make use of. To contribute to the project, please submit a PR for our review. Before contributing any source code, familiarize yourself with the Apache License 2.0 (license.md), which controls the licensing for this project.

