# MyGarage
## CF 401 Mid-Term project

[![Build Status](https://travis-ci.com/Chemenes/myGarage.svg?branch=master)](https://travis-ci.com/Chemenes/myGarage)

## Table of Contents
  - [myGarage Overview](#myGarage-Overview)
  - [API Data Organization](#API-Data-Organization)
  - [Collaborators and How to Contribute](#Collaborators)
  - [API Documentation](#API-Routes-and-Documentation)
  - [Load Testing Results](#Load-Testing-Analysis)

### myGarage Overview

MyGarage provides and API supporting the creation of vehicle-centric data stores and user interactions.  The API provides the following capabilities:

  - Secure signon and password storage
  - User account profiles
  - User created vehicles organized in "garages"
  - All manner of vehicle types, from cars to airplanes
  - Vehicle maintenance tracking
  - Ability to attach documents such as photos and document scans to all resources

[Back to top](#Table-of-Contents)

### API Data Organization

The API is implemented using a collection of MondoDB document models:

  - Accounts
  - Users
  - Vehicles
  - Maintenance Logs
  - Attachments

Relationships between models, depicted below, include:

- One to One:
  - Account to Profile

- One to Many:
  - Profile to Garage
  - Garage to Vehicle
  - Garage, Vehicle and Profile to Attachment
  - Vehicle to Maintenance Log

![](https://github.com/Chemenes/myGarage/blob/master/load-testing/assets/myGarage-erd.jpg)

[Back to top](#Table-of-Contents)

### Collaborators

MyGarage is the creation of [Devin Cunningham](https://github.com/DevinTyler260), [Chris Hemenes](https://github.com/Chemenes) and [Tracy Williams](https://github.com/TCW417).  We welcome others to join us in building out the capabilities of this API!  Here's how:

### How to Contribute

You'll need an account on github.com, an installation of node.js npm. Search google for instructions on how to install these tools on your system.

Once you have the required prerequisites installed:

- Fork [this repo](https://github.com/TCW417/MyGarage)
- Clone it to your local machine
- Do your work
- Submit a pull request back to the source repo. Include a complete description of your proposed contribution.

We're eager to see what you come up with! If you have any questions feel free to reach out to any one of the original team members.

July, 2018, Seattle WA

[Back to top](#Table-of-Contents)

### API Routes and Documentation

Click on a route to jump to its documentation

- POST (Create)
  - [/api/signup](#POST-/api/signup)
  - [/api/profiles](#POST-/api/profiles)
  - [/api/garages](#POST-/api/garages)
  - [/api/vehicles](#POST-/api/vehicles?[garage|g]=garageId)
  - [/api/maintenance-logs](#POST-/api/maintenance-logs?[vehicle|v]=vehicleId)
  - [/api/attachments](#POST-/api/attachments?[profile|p|garage|g|vehicle|v|maintenance-log|l]=modelId)

- GET (Read)
  - [/api/login](#GET-/api/login)
  - [/api/profiles](#GET-/api/profiles)
  - [/api/garages](#GET-/api/garages)
  - [/api/vehicles](#GET-/api/vehicles)
  - [/api/maintenance-logs](#GET-/api/maintenance-logs)
  - [/api/attachments](#GET-/api/attachments)

- PUT (Update)
  - [/api/accounts/email](#PUT-/api/accounts/email)
  - [/api/accounts/pw](#PUT-/api/accounts/pw)
  - [/api/profiles](#PUT-/api/profiles)
  - [/api/garages](#PUT-/api/garages)
  - [/api/vehicles](#PUT-/api/vehicles)
  - [/api/maintenance-logs](#PUT-/api/maintenance-logs)

- DELETE
  - [/api/accounts](#DELETE-/api/accounts)
  - [/api/profiles](#DELETE-/api/profiles)
  - [/api/garages](#DELETE-/api/garages)
  - [/api/vehicles](#DELETE-/api/vehicles)
  - [/api/maintenance-logs](#DELETE-/api/maintenance-logs)
  - [/api/attachments](#DELETE-/api/attachments)

[Back to top](#Table-of-Contents)

## API DOCUMENTATION

### POST (Create)

#### POST /api/signup

This route is used to create a new account in MyGarage.  It requires a request body of the form:
```
{
    username: yourUniqueUsername,
    password: yourPassword,
    email: yourEmailAddress
}
```
On success, the API will respond with status code 200 and the bearer authorization token associated with this MyGarage session. For example:
```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI1YjQ0ZmNiZWVjNTE0NTAwMjViMGI0YzgiLCJ0b2tlblNlZWQiOiI5MjQxOGJiMmUzMGFlNmNlYjhmMmE4NzIiLCJpYXQiOjE1MzEyNDc4MDZ9.NQQfZLrrEQqVLgp1vIgUzV_PZPjCsdnlORUJXh4cBSo"
}
```
Note that a new authorization token is issued on every login.

Error codes will be returned for duplicate username or password (409), or missing information (400).

[Back to API TOC](#API-Routes-and-Documentation)

#### POST /api/profiles

POST to /api/profiles creates a new MyGarage profile.  The profile is automatically associated with the current session.

The body of the request must include the following properties:
```
firstName (required)
lastName
bio
location
profileImageUrl
```
On success the API will return an object such as this:
```
{
    "attachments": [],
    "garages": [],
    "_id": "5b44ff5856a4dc002500c186",
    "firstName": "user",
    "lastName": "two",
    "bio": "and avid vehicle user",
    "location": "Seattle, WA",
    "accountId": "5b44fdfa56a4dc002500c185",
    "profileImageUrl": "http://my.image.site/user2.jpg",
    "__v": 0
}
```
The `_id` property is required for creating new items within MyGarage, so your client app should save this for the duration of the session.

Errors are returned for a badly formated request (400), invalid authorization token (401), request missing required information (400).

[Back to API TOC](#API-Routes-and-Documentation)

#### POST /api/garages

Garages hold Vehicles. A user may have any number of garages containing any number of vehicles.  This POST route automatically associates the garage with the current profile. 

The body of the GET request to /api/garages includes these fields:
```
name (required)
description
location
attachments (array of attachment IDs)
```
On success the API responds in this form:
```
{
    "vehicles": [],
    "attachments": [],
    "_id": "5b45015656a4dc002500c187",
    "name": "User 2's first garage",
    "description": "like I said, user2's first garage. Duh.",
    "profileId": "5b44ff5856a4dc002500c186",
    "location": "Seattle, WA",
    "createdAt": "2018-07-10T18:56:22.739Z",
    "updatedAt": "2018-07-10T18:56:22.739Z",
    "__v": 0
}
```
Error responses are returned for bad request (400) or bad authorization token (401).

[Back to API TOC](#API-Routes-and-Documentation)

#### POST /api/vehicles?[garage|g]=garageId

POSTs to /api/vehicles create vehicle resources. The request body includes these fields:
```
name (required)
make
model
type (required. Must be one of car, truck, boat, rv, plane, atv, suv or motorcycle. Defaults to car.)
attachments (optional array of attachment IDs)
```
The query string associates the vehicle with an existing garage.

On success, the API responds in this form:
```
{
    "type": "car",
    "maintenanceLogs": [],
    "attachments": [],
    "_id": "5b450d77ba1e1c2105154e31",
    "profileId": "5b450d14ba1e1c2105154e2f",
    "name": "user3 car",
    "garageId": "5b450d46ba1e1c2105154e30",
    "createdAt": "2018-07-10T19:48:07.540Z",
    "updatedAt": "2018-07-10T19:48:07.540Z",
    "__v": 0
}
```
Errors are returned for bad requests and invalid authorization token.

[Back to API TOC](#API-Routes-and-Documentation)

#### POST /api/maintenance-logs?[vehicle|v]=vehicleId

Vehicles can have maintenance log records associated with them. These logs, in turn, can have attachments added to them. (See /api/attachments below.)

The required query string provides the ID of the vehicle to which the maintenance log record is to be attached.

The maintenance-logs route requires a body with these properties:
```
description (required)
dateOfService
attachments (optional. array of attachment IDs)
```
On success, the route response with:
```
{
    "_id": "5b450fb45c39ee0025528abd",
    "attachments": [],
    "description": "Repair Bill",
    "vehicleId": "5b450e79f3b84e002500529f",
    "profileId": "5b450d98f3b84e002500529d",
    "createdAt": "2018-07-10T19:57:40.781Z",
    "updatedAt": "2018-07-10T19:57:40.781Z",
    "__v": 0
}
```
Errors are reported for bad request and invalid token.

[Back to API TOC](#API-Routes-and-Documentation)

#### POST /api/attachments?[profile|p|garage|g|vehicle|v|maintenance-log|l]=modelId

Any resource (other than the accounts) can have files attached.  These can be scans of maitenance receipts, images, PDFs, etc.

You create an attachment by uploading it using the POST /api/attachments route. Use the "file" input box type in HTML or use Postman's file option. Add a query to the route of the form model=modelId to associate the attachment with the resource. The query string is required.

For example, to attach a document to a vehicle (perhaps an image of the registration) you would to a POST request to /api/attachments?vehicle=vehicleId with the scan file included in the body of the message.

maintenance-log and log are synonymous.

On success you'll get back JSON in this form:
```
{
    "_id": "5b451bdcba1e1c2105154e32",
    "originalName": "r1200.jpg",
    "encoding": "7bit",
    "mimeType": "image/jpeg",
    "url": "https://mygarage-filestore.s3.amazonaws.com/54a50ac8cd3562a8296929b171e537e9.r1200.jpg",
    "awsKey": "54a50ac8cd3562a8296929b171e537e9.r1200.jpg",
    "profileId": "5b450d14ba1e1c2105154e2f",
    "createdAt": "2018-07-10T20:49:32.580Z",
    "updatedAt": "2018-07-10T20:49:32.580Z",
    "__v": 0
}
```
The url property is the link provided by AWS that can be used to retrieve the document for display.

Error codes will be returned for bad request.

[Back to API TOC](#API-Routes-and-Documentation)

### GET (Read)

#### GET /api/login

Use the GET /api/login route to log in to an existing MyGarage account. The route uses `basic authentication` to pass username and password to the server.  On success, the API will respond with the profile ID and a fresh bearer authorization token:
```
{
    "profileId": "5b44fdfa56a4dc002500c185",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI1YjQ0ZmRmYTU2YTRkYzAwMjUwMGMxODUiLCJ0b2tlblNlZWQiOiIxZTBjOWRiMjVhYzlhMjg3ZDVjNmUzM2QiLCJpYXQiOjE1MzEyNDgxNDN9.lHZEsShR9mm0Ijdyv6TKWYW3Q05D9Fv2HcIwJ7vYzpw"
}
```
The profile ID is required to create or modify an other resource within MyGarage.

Error codes are returned for invalid username or password (401) and bad request (400).

[Back to API TOC](#API-Routes-and-Documentation)

#### GET /api/profiles

The profiles GET route returns the profile associated with the current session. You must have done a previous GET /api/login. The profile is found from data stored with the authentication token provided on login which is passed to the server as a bearer auth token.  

On success, the API return JSON of the form:
```
{
    "attachments": [],
    "garages": [],
    "_id": "5b44ff5856a4dc002500c186",
    "firstName": "user",
    "lastName": "two",
    "bio": "and avid vehicle user",
    "location": "Seattle, WA",
    "accountId": "5b44fdfa56a4dc002500c185",
    "profileImageUrl": "http://my.image.site/user2.jpg",
    "__v": 0
}
```
Errors result from missing or malformed query string (bad request) or profileId not found (404).

[Back to API TOC](#API-Routes-and-Documentation)

#### GET /api/garages

The garages GET route takes a query string of the form id=garageId, or /api/garages?id=garageId.  On success it responds with JSON of the form:
```
{
    "vehicles": [],
    "attachments": [],
    "_id": "5b45015656a4dc002500c187",
    "name": "User 2's first garage",
    "description": "like I said, user2's first garage. Duh.",
    "profileId": "5b44ff5856a4dc002500c186",
    "location": "Seattle, WA",
    "createdAt": "2018-07-10T18:56:22.739Z",
    "updatedAt": "2018-07-10T18:56:22.739Z",
    "__v": 0
}
```
Error responses are returned for bad request (400) or bad authorization token (401) or garageId not found (404).

[Back to API TOC](#API-Routes-and-Documentation)

#### GET /api/vehicles

The vehicles GET route takes a query string of the form id=vehicleId, or /api/vehicles?id=vehicleId.  On success, the API responds in this form:
```
{
    "type": "car",
    "maintenanceLogs": [],
    "attachments": [],
    "_id": "5b450d77ba1e1c2105154e31",
    "profileId": "5b450d14ba1e1c2105154e2f",
    "name": "user3 car",
    "garageId": "5b450d46ba1e1c2105154e30",
    "createdAt": "2018-07-10T19:48:07.540Z",
    "updatedAt": "2018-07-10T19:48:07.540Z",
    "__v": 0
}
```
Errors are returned for bad requests (400), vehicle not found (404) and invalid authorization token (401).

[Back to API TOC](#API-Routes-and-Documentation)

#### GET /api/maintenance-logs

The maintenance-logs GET route takes a query string of the form id=maintenceLogId, or /api/maintenance-logs?id=maintenanceLogId.  On success, the API responds in this form:
```
{
    "_id": "5b450fb45c39ee0025528abd",
    "attachments": [],
    "description": "Repair Bill",
    "vehicleId": "5b450e79f3b84e002500529f",
    "profileId": "5b450d98f3b84e002500529d",
    "createdAt": "2018-07-10T19:57:40.781Z",
    "updatedAt": "2018-07-10T19:57:40.781Z",
    "__v": 0
}
```
Errors are returned for bad requests (400), log entry not found (404) and invalid authorization token (401).

[Back to API TOC](#API-Routes-and-Documentation)

#### GET /api/attachments

The attachments GET route takes a query string of the form id=attachmentId, or /api/attachments?id=attachmentId.  On success, the API responds in this form:
```
{
    "_id": "5b451bdcba1e1c2105154e32",
    "originalName": "r1200.jpg",
    "encoding": "7bit",
    "mimeType": "image/jpeg",
    "url": "https://mygarage-filestore.s3.amazonaws.com/54a50ac8cd3562a8296929b171e537e9.r1200.jpg",
    "awsKey": "54a50ac8cd3562a8296929b171e537e9.r1200.jpg",
    "profileId": "5b450d14ba1e1c2105154e2f",
    "createdAt": "2018-07-10T20:49:32.580Z",
    "updatedAt": "2018-07-10T20:49:32.580Z",
    "__v": 0
}
```
Errors are returned for bad requests (400), attachment entry not found (404) and invalid authorization token (401).

[Back to API TOC](#API-Routes-and-Documentation)


### PUT (Update)
#### PUT /api/accounts/email

This route is used to update a user's email address.  The body of the request must be a JSON string of the form:
```
{
    "email": "newEmail@address.com" 
}
```
The route responds with 200 on success, 400 on bad request, 401 on bad authorization and 409 if email already exists in the database.

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/accounts/pw

This route is used to update a user's password. The body of the request is a JSON string:
```
{
    "pw": "newPassword"
}
```
The route responds with 200 on success, 400 on bad request, 401 on bad authorization and 409 if email already exists in the database.

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/profiles

To update an existing profile, simply pass the API a request body with the properties you wish to change and their new values.  For example, to just change the bio field you'd send:
```
{
    "bio": "This is my new bio! I just gained another grandchild!"
}
```
The API retrieves your profile using the login information stored in the bearer authorization token.

Status 200 is returned on success, 400 for bad request, 401 for bad authentication, 404 if you try this before you're logged in.

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/garages

To update an existing garage, first GET the garage, then change whichever values need updating. Then use this route to send the updated garage back to the database. The route takes a query string of the form ?id=garageId. The body of the request should be the JSON stringified garage object.  On success you will get back the updated garage object as a JSON string.

Status 200 is returned on success, 400 for bad request, 401 for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/vehicles

To update an existing vehicle, first GET the vehicle, then change whichever values need updating. Then use this route to send the updated vehicle back to the database. The route takes a query string of the form ?id=vehicleId. The body of the request should be the JSON stringified vehicle object.  On success you will get back the updated vehicle object as a JSON string.

Status 200 is returned on success, 400 for bad request, 401 for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/maintenance-logs

To update an existing maintenance-log, first GET the maintenance-log, then change whichever values need updating. Then use this route to send the updated maintenance-log back to the database. The route takes a query string of the form ?id=maintenance-logId. The body of the request should be the JSON stringified maintenance-log object.  On success you will get back the updated maintenance-log object as a JSON string.

Status 200 is returned on success, 400 for bad request, 401 for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

### DELETE
#### DELETE /api/accounts
This request delete any accounts created by a user.

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/profiles
This process will successfully delete a users profile with a 200 status code.

Status codes 404 will return if a profile is not found, 401 for a bad request and 404 for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/garages
This process will successfully delete a users garage with a 200 status code.

Status codes 404 will return if a garage is not found, 401 for a missing token and 400 for a bad request and for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/vehicles
This process will successfully delete a users vehicle with a 200 status code.

Status codes 404 will return if a vehicle is not found, 401 for a missing token and 400 for a bad request and for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/maintenance-logs
This process will successfully delete a users maintenance log(Documented time spent fixing car) with a 200 status code.

Status codes 404 will return if a log is not found, 401 for a missing token and 400 for a bad request and for bad authentication.


[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE/api/attachments
This process will successfully delete a users attachments(Any images, reciepts, maps, ect associated with user) with a 200 status code.

Status codes 404 will return if a attachment is not found, 401 for a missing token and 400 for a bad request and for bad authentication.

[Back to API TOC](#API-Routes-and-Documentation)

### Load Testing Analysis

The API was tested on the production environment hosted by Heroku with MongoDB provisioned by mLab. Note that both of these resources are of the "sandbox" or free variety so these results must be understood with that in mind. Provisioning the API with "paid" resources providing parallel execution of multiple server instances would significantly improve results.

#### Test Approach

One test lengthy flow was utilized. Sequential steps were:
- Signup for a new account
- Login to new account
- Create new profile
- Create new garage
- Create new vehicle

Three test phases were employed:
- Warmup, 10 seconds at 50 RPS (Requests Per Second)
- Ramp-up, 20 seconds going from 50 to 200 RPS
- Full load, 30 seconds ast 200 RPS

#### Results Summary

| Summary | |
|---------|-|
| Test duration | 220 seconds |
| Scenarios created | 9,049 |
| Scenarios completed | 5,993 |
| Requests completed | 41,386 |

| Scenario Counts | |
|-----------------|-|
| Signup thru Vehicle | 9,049 (100%) |

| HTML Code | Meaning | Count |
|------|---------|-------|
| 200 | Success | 40,660 |
| 503 | Server error | 726 |

| Errors | |
|-------|-|
| ECONNRESET | 2,413 |

The 503 HTML codes and ECONNRESET errors are a result of the Heroku dyno (server instance) becoming overtaxed by the test.  

##### Detailed Results

![](https://github.com/Chemenes/myGarage/blob/master/load-testing/assets/latency-distro.jpg)
![](https://github.com/Chemenes/myGarage/blob/master/load-testing/assets/latency-at-intervals.jpg)

This chart shows the distribution of latency measurements for five categories.  Latency is a measure of the delay in processing server requests resulting from network delays. As such it is largely out of our control, beyond the possible upgrading of on-site networking equipment.  This should not be confused with response time, which is a measure of the end-to-end time from submission of a request to return of a result.  

- MIN (too small to show up on the scale of this graph), 70.9ms
- MAX 60.041 seconds
- MEDIAN 14.575 seconds
- P95 44.884 seconds (95% of users experienced this latence or better)
- P99 55.246 seconds (99% of users experienced this latence or better)

These results are not adequate for a production API. It is recommended that additional server resources be allocated for these tests to measure the effect.

![](https://github.com/Chemenes/myGarage/blob/master/load-testing/assets/concurrent-users.jpg)

This chart depicts the total number of virtual users hitting the API as a function of test time.  The test ramped up the number of users from 10/second to 200/second over the course of 20 seconds. This chart demostrate is another indication of the latency increase caused by increased number of users hitting our limited server resources.

![](https://github.com/Chemenes/myGarage/blob/master/load-testing/assets/rps-results.jpg)

These charts represent measurement of Responses Per Second (RPS) as seen by the load test suite.   You'll notice that the RPS rate peaked early in the test run and then declined steadily as the test progressed. The number of responses per second is directly related to the number of cores (Heroku dynos) allocated to the server, so one can expect this figure to improve directly with increased investment in server resources.

![](https://github.com/Chemenes/myGarage/blob/master/load-testing/assets/http-codes.jpg)

Finally, the HTTP Codes chart shows the distribution of codes returned by the server as a function of test run time. Given the conditions of the test and the resources provided for it, these results are not unexpected. 200 (Success) is by far the dominant result. 503 internal server errors arose once the test was fully underway and the single Heroku dyno became overwhelmed.

##### Conclusion

While these tests are exercising a limited portion of the capabilities of our API, the are representative of the responsiveness actual users are likely to see with the application deployed using free Infrastructure As A Service (IAAS) facilities.  Improvement in performance (if desired) can easily be achieved by increasing investment in IAAS resources.

