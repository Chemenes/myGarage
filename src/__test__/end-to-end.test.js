import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import Account from '../model/account';
import Profile from '../model/profile';
import Garage from '../model/garage';
import Vehicle from '../model/vehicle';
import Logs from '../model/maintenance-log';
import Attachment from '../model/attachment';

import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;
beforeAll(async () => { await startServer(); });
afterAll(stopServer);
beforeEach(async () => {
  await Attachment.remove();
  await Logs.remove();
  await Vehicle.remove();
  await Garage.remove();
  await Profile.remove();
  await Account.remove();
});

describe('End-To-End myGarage Test', () => {
  test('End-to-End test in one test otherwise it gets completely messed up', async () => {
    //
    // Create account /api/signup
    //
    const testUsername = faker.internet.userName();
    const testPassword = faker.lorem.words(2);
    const testEmail = faker.internet.email();
    const mockAccount = {
      username: testUsername,
      email: testEmail,
      password: testPassword,
    };
    
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(mockAccount);
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('Unexpected error testing good signup.');
    }

    //
    // use new account to log in
    //
    let loginResult;  
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(testUsername, testPassword); 
      loginResult = response.body;
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.profileId).toBeNull();
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid signIn');
    }
  
    //
    // We're logged in, now create a profile
    //
    const mockProfile = {
      bio: faker.lorem.words(20),
      location: faker.address.city(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
    let response;
    try {
      response = await superagent.post(`${apiUrl}/profiles`)
        .authBearer(loginResult.token)
        .send(mockProfile);
    } catch (err) {
      expect(err).toEqual('POST 200 test that should pass');
    }
    expect(response.status).toEqual(200);
    let profileResult = response.body;
    expect(profileResult.bio).toEqual(mockProfile.bio);

    // 
    // login again and verify that profileId is added to the response
    //
    try {
      response = await superagent.get(`${apiUrl}/login`)
        .auth(testUsername, testPassword); 
      loginResult = response.body;
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.profileId).toBeTruthy();
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid signIn');
    }
    //
    // Now create a garage
    //
    const garage = {
      name: faker.lorem.words(2),
      description: faker.lorem.words(8),
      location: `${faker.address.city()}, ${faker.address.state()}`,
    };

    let garageResult;
    try {
      const gResponse = await superagent.post(`${apiUrl}/garages`)
        .authBearer(loginResult.token)
        .send(garage);
      garageResult = gResponse.body;
    } catch (err) {
      expect(err).toEqual('POST 200 test that should pass');
    }
    expect(response.status).toEqual(200);
    expect(garageResult.profileId).toEqual(loginResult.profileId.toString());

    //
    // get the profile now and make sure garage was added
    //
    try {
      response = await superagent.get(`${apiUrl}/profiles`)
        .query({ id: profileResult._id.toString() })
        .authBearer(loginResult.token);
      expect(response.status).toEqual(200);
      profileResult = response.body;
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(profileResult.garages).toHaveLength(1);
    expect(profileResult.garages[0]).toEqual(garageResult._id.toString());

    //
    // now create 3 vehicles
    //
    const vehicles = [];
    for (let i = 0; i < 3; i++) {
      const vehicle = {
        name: faker.name.firstName(),
        make: faker.name.firstName(),
        model: faker.name.firstName(),
        type: 'car',
        // profileId: profileResult._id,
        // garageId: garageResult._id,
      };
      vehicles.push(vehicle);
    }

    // add vehicles db which will add them to garage
    try {
      response = await superagent.post(`${apiUrl}/vehicles`)
        .authBearer(loginResult.token)
        .query({ garage: garageResult._id })
        .send(vehicles[0]);
      vehicles[0] = response.body;

      response = await superagent.post(`${apiUrl}/vehicles`)
        .authBearer(loginResult.token)
        .query(({ g: garageResult._id }))
        .send(vehicles[1]);
      vehicles[1] = response.body;

      response = await superagent.post(`${apiUrl}/vehicles`)
        .authBearer(loginResult.token)
        .query({ garage: garageResult._id })
        .send(vehicles[2]);
      vehicles[2] = response.body;
    } catch (err) {
      expect(err).toEqual('POST 200 test that should pass');
    }
    expect(response.status).toEqual(200);
    
    // get garage back to verify vehicles in it
    try {
      response = await superagent.get(`${apiUrl}/garages`)
        .query({ id: garageResult._id.toString() })
        .authBearer(loginResult.token);
      garageResult = response.body;
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(garageResult.vehicles).toHaveLength(3);

    //
    // Now add maintenance records to vehicles
    //
    const maintenanceLog = {
      description: faker.lorem.words(3),
      dateOfService: new Date().toISOString(),
    };

    const logs = [];
    try {
      response = await superagent.post(`${apiUrl}/maintenance-logs`)
        .authBearer(loginResult.token)
        .query({ v: vehicles[0]._id })
        .send(maintenanceLog);
      logs[0] = response.body;

      response = await superagent.post(`${apiUrl}/maintenance-logs`)
        .authBearer(loginResult.token)
        .query({ vehicle: vehicles[1]._id })
        .send(maintenanceLog);
      logs[1] = response.body;

      response = await superagent.post(`${apiUrl}/maintenance-logs`)
        .authBearer(loginResult.token)
        .query({ v: vehicles[2]._id })
        .send(maintenanceLog);
      logs[2] = response.body;
    } catch (err) {
      expect(err).toEqual('maintence log POST that should pass');
    }
    expect(response.status).toEqual(200);
    
    // retrieve vehicles to verify maintenance records
    // were added
    response = await superagent.get(`${apiUrl}/vehicles`)
      .authBearer(loginResult.token)
      .query({ id: vehicles[0]._id });
    vehicles[0] = response.body;
    expect(vehicles[0].maintenanceLogs).toHaveLength(1);

    expect(response.status).toEqual(200);
    vehicles[1] = await superagent.get(`${apiUrl}/vehicles`)
      .authBearer(loginResult.token)
      .query({ id: vehicles[1]._id });
    vehicles[1] = vehicles[1].body;
    expect(vehicles[1].maintenanceLogs).toHaveLength(1);

    vehicles[2] = await superagent.get(`${apiUrl}/vehicles`)
      .authBearer(loginResult.token)
      .query({ id: vehicles[2]._id });
    vehicles[2] = vehicles[2].body;
    expect(vehicles[2].maintenanceLogs).toHaveLength(1);

    //
    // now sprinkle some attachments around
    //
    const testFile = `${__dirname}/asset/r1200.jpg`;

    // add one to the profile
    try {
      response = await superagent.post(`${apiUrl}/attachments`)
        .authBearer(loginResult.token)
        .field('filename', 'R1200.JPG')
        .attach('attachment', testFile)
        .query({ profile: profileResult._id.toString() });
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('POST 200 attachment unexpected error');
    }
    // get profile again to see if it took
    try {
      response = await superagent.get(`${apiUrl}/profiles`)
        .query({ id: profileResult._id.toString() })
        .authBearer(loginResult.token);
      expect(response.status).toEqual(200);
      profileResult = response.body;
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(profileResult.attachments).toHaveLength(1);

    // add one to the garage
    try {
      response = await superagent.post(`${apiUrl}/attachments`)
        .authBearer(loginResult.token)
        .field('filename', 'R1200.JPG')
        .attach('attachment', testFile)
        .query({ garage: garageResult._id.toString() });
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('POST 200 attachment unexpected error');
    }
    // get garage again to see if it took
    try {
      response = await superagent.get(`${apiUrl}/garages`)
        .query({ id: garageResult._id.toString() })
        .authBearer(loginResult.token);
      expect(response.status).toEqual(200);
      garageResult = response.body;
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(garageResult.attachments).toHaveLength(1);

    // add one to vehicle[1]
    try {
      response = await superagent.post(`${apiUrl}/attachments`)
        .authBearer(loginResult.token)
        .field('filename', 'R1200.JPG')
        .attach('attachment', testFile)
        .query({ v: vehicles[1]._id.toString() });
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('POST 200 attachment unexpected error');
    }
    // get vehicle again to see if it took
    try {
      response = await superagent.get(`${apiUrl}/vehicles`)
        .query({ id: vehicles[1]._id.toString() })
        .authBearer(loginResult.token);
      expect(response.status).toEqual(200);
      vehicles[1] = response.body;
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(vehicles[1].attachments).toHaveLength(1);

    // add one to maintenance log 0 (vehicle 0)
    try {
      response = await superagent.post(`${apiUrl}/attachments`)
        .authBearer(loginResult.token)
        .field('filename', 'R1200.JPG')
        .attach('attachment', testFile)
        .query({ maintenancelog: logs[0]._id.toString() });
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('POST 200 attachment unexpected error');
    }
    // get vehicle again to see if it took
    try {
      response = await superagent.get(`${apiUrl}/maintenance-logs`)
        .query({ id: logs[0]._id.toString() })
        .authBearer(loginResult.token);
      expect(response.status).toEqual(200);
      logs[0] = response.body;
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(logs[0].attachments).toHaveLength(1);

    // add one to maintenance log 1 (vehicle 1)
    try {
      response = await superagent.post(`${apiUrl}/attachments`)
        .authBearer(loginResult.token)
        .field('filename', 'R1200.JPG')
        .attach('attachment', testFile)
        .query({ l: logs[1]._id.toString() });
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('POST 200 attachment unexpected error');
    }
    // get vehicle again to see if it took
    try {
      response = await superagent.get(`${apiUrl}/maintenance-logs`)
        .query({ id: logs[1]._id.toString() })
        .authBearer(loginResult.token);
      expect(response.status).toEqual(200);
      logs[1] = response.body;
    } catch (err) {
      expect(err.status).toEqual('GET that should work.');
    }
    expect(logs[1].attachments).toHaveLength(1);
  });
});
