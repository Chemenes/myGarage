# Model Plans
### The API is implemented using a collection of MondoDB document models:
  - Accounts
  - Users
  - Garages
  - Vehicles
  - Maintenance Logs
  - Attachments
  - Clubs

### Relationships between models include:
- One to Many:
  - Account to Profile
  - Profile to Garages
  - Garage to Vehicle
  - Garage, Vehicle and Profile to Attachment

- Many to Many:
  - Vehicle to Maintenance Log

### API Routes
- POST (Create)
  - /api/v1/accounts
  - /api/v1/profiles
  - /api/v1/garages  
  - /api/v1/vehicles
  - /api/v1/maintenance
  - /api/v1/attachments
  - /api/v1/club
- GET (Read)
  - /api/v1/accounts
  - /api/v1/profiles
  - /api/v1/garages  
  - /api/v1/vehicles
  - /api/v1/maintenance
  - /api/v1/attachments
  - /api/v1/club
- PUT (Update)
  - /api/v1/accounts
  - /api/v1/profiles
  - /api/v1/garages  
  - /api/v1/vehicles
  - /api/v1/maintenance
  - /api/v1/attachments
  - /api/v1/club
- DELETE
  - /api/v1/profiles
  - /api/v1/garages  
  - /api/v1/vehicles
  - /api/v1/attachments
  - /api/v1/club
