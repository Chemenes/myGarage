# MyGarage
## CF 401 Mid-Term project

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

- One to Many:
  - Account to Profile
  - Profile to Garage
  - Garage to Vehicle
  - Garage, Vehicle and Profile to Attachment

- Many to Many:
  - Vehicle to Maintenance Log

### API Routes

- POST (Create)
  - /api/v1/accounts
  - /api/v1/profiles
  - /api/v1/vehicles
  - /api/v1/maintenance
  - /api/v1/attachments
  - /api/v1/club
- GET (Read)
  - /api/v1/accounts
  - /api/v1/profiles
  - /api/v1/vehicles
  - /api/v1/maintenance
  - /api/v1/attachments
  - /api/v1/club
- PUT (Update)
  - /api/v1/accounts
  - /api/v1/profiles
  - /api/v1/vehicles
  - /api/v1/maintenance
  - /api/v1/attachments
  - /api/v1/club
- DELETE
  - /api/v1/profiles
  - /api/v1/vehicles
  - /api/v1/attachments
  - /api/v1/club

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