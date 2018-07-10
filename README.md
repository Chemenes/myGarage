# MyGarage
## CF 401 Mid-Term project

[![Build Status](https://travis-ci.com/Chemenes/myGarage.svg?branch=master)](https://travis-ci.com/Chemenes/myGarage)

MyGarage provides and API supporting the creation of vehicle-centric data stores and user interactions.  The API provides the following capabilities:

  - Secure signon and password storage
  - User account profiles
  - User created vehicles organized in "garages"
  - All manner of vehicle types, from cars to airplanes
  - Vehicle maintenance tracking
  - Scheduled maintenance reminders via SMS text message
  - Ability to attach photos to vehicles
  - Ability to attach scanned documents to vehicles and maintenance records
  - Provision for formation of special-interest groups of vehicle owners (aka Clubs)
  - And more...

### API Data Organization

The API is implemented using a collection of MondoDB document models:

  - Accounts
  - Users
  - Vehicles
  - Maintenance Logs
  - Attachments
  - Clubs

Relationships between models include:

- One to One:
  - Account to Profile

- One to Many:
  - Profile to Garage
  - Garage to Vehicle
  - Garage, Vehicle and Profile to Attachment
  - Vehicle to Maintenance Log

### API Routes and Documentation

Click on a route to jump to its documentation

- POST (Create)
  - [/api/signup](#POST-/api/signup)
  - [/api/profiles](#POST-/api/profiles)
  - [/api/garages](#POST-/api/garages)
  - [/api/vehicles](#POST-/api/vehicles)
  - [/api/maintenance-logs](#POST-/api/maintenance-logs)
  - [/api/attachments](#POST-/api/attachments)

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

POST to /api/profiles creates a new MyGarage profile.  The body of the request must include the following properties:
```
firstName (required)
lastName
bio
location
profileImageUrl
accountId (required, provided by GET /api/login)
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

Garages hold Vehicles. A user may have any number of garages containing any number of vehicles. The body of the GET request to /api/garages includes these fields:
```
name (required)
description
location
profileId (required, provided at login)
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

#### POST /api/vehicles

POSTs to /api/vehicles create vehicle resources. The request body includes these fields:
```
name (required)
make
model
type (required. Must be one of car, truck, boat, rv, plane, atv, suv or motorcycle. Defaults to car.)
garageId (required)
profileId (required)
attachments (array of attachment IDs)
```
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

#### POST /api/maintenance-logs

Vehicles can have maintenance log records associated with them. These logs, in turn, can have attachments added to them. (See /api/attachments below.)

The maintenance-logs route requires a body with these properties:
```
description (required)
dateOfService
profileId (required)
vehicleId (required)
attachments (array of attachment IDs)
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

#### POST /api/attachments

Any resource (other than the accounts) can have files attached.  These can be scans of maitenance receipts, images, PDFs, etc.

You create an attachment by uploading it using the POST /api/attachments route. Use the "file" input box type in HTML or use Postman's file option.

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
The _id property can be used to attach the document to an existing resource by getting it, pushing the _id onto its attachments array and then updating the resource.

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

The profiles GET route takes a query string of id=profileId. So the full URI would be /api/profiles?id=profileId where profileID is the id string returned upon successful login.  

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

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/accounts/pw

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/profiles

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/garages

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/vehicles

[Back to API TOC](#API-Routes-and-Documentation)

#### PUT /api/maintenance-logs

[Back to API TOC](#API-Routes-and-Documentation)

### DELETE
#### DELETE /api/accounts

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/profiles

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/garages

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/vehicles

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE /api/maintenance-logs

[Back to API TOC](#API-Routes-and-Documentation)

#### DELETE/api/attachments

[Back to API TOC](#API-Routes-and-Documentation)
