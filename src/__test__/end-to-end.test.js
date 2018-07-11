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
    let signupResult;
    // expect.assertions(2);
    const mockAccount = {
      username: testUsername,
      email: testEmail,
      password: testPassword,
    };
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(mockAccount);
      // Object.assign(signupResult, response.body);
      signupResult = response.body;
      console.log('>>> signupResult:', JSON.stringify(signupResult, null, 2));
      expect(response.status).toEqual(200);
      // expect(response.body.token).toBeTruthy();
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
      // Object.assign(loginResult, response);
      loginResult = response.body;
      console.log('>>> loginResult:', JSON.stringify(loginResult, null, 2));
      expect(response.status).toEqual(200);
      // expect(response.body.token).toBeTruthy();
      // expect(response.body.profileId).toBeDefined();
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
      accountId: signupResult.accountId,
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
    const profileResult = response.body;
    console.log('>>> profileResult', JSON.stringify(profileResult, null, 2));

    //
    // Now create a garage
    //
    const garage = {
      name: faker.lorem.words(2),
      description: faker.lorem.words(8),
      location: `${faker.address.city()}, ${faker.address.state()}`,
      profileId: profileResult._id,
      // vehicles?  Need to mock vehicles first.  
      // attachments: [mockData.attachment._id],  
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
    console.log('>>> garageResult', JSON.stringify(garageResult, null, 2));

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
        profileId: profileResult._id,
        garageId: garageResult._id,
      };
      vehicles.push(vehicle);
    }

    // add vehicles db which will add them to garage
    try {
      response = await superagent.post(`${apiUrl}/vehicles`)
        .authBearer(loginResult.token)
        .send(vehicles[0]);
      response = await superagent.post(`${apiUrl}/vehicles`)
        .authBearer(loginResult.token)
        .send(vehicles[1]);
      response = await superagent.post(`${apiUrl}/vehicles`)
        .authBearer(loginResult.token)
        .send(vehicles[2]);
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
    console.log('>>> post vehicle add garageResult', JSON.stringify(garageResult, null, 2));
    expect(garageResult.vehicles).toHaveLength(3);
  });
});
