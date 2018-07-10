import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createGarageMockPromise } from './lib/garage-mock';
import { createVehicleMockPromise, removeAllResources } from './lib/vehicle-mock';/*eslint-disable-line*/
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING ROUTER PROFILE', () => {
  let mockData;
  let token;
  let garage;
  // let profile;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    // await removeAllResources(); 
    try {
      mockData = await createGarageMockPromise(); 
      garage = mockData.garage; /*eslint-disable-line*/
      token = mockData.token; /*eslint-disable-line*/
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in vehicle-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('POST VEHICLE ROUTES TESTING', () => {
    test('POST 200 to /api/vehicles for successful vehicle creation', async () => {
      const mockVehicle = {
        name: faker.name.firstName(),
        make: faker.name.lastName(),
        model: faker.name.lastName(),
        type: 'car',
        garageId: garage._id,                
        profileId: garage.profileId._id,
      };
      let response;
      console.log('$$$$$$ MOCK GARAGE ', garage);
      
      console.log('$$$$$$ MOCK VEHICLE ', mockVehicle);
      
      try {
        response = await superagent.post(`${apiUrl}/vehicles`)
          .authBearer(token)
          .send(mockVehicle);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(mockVehicle.name);
      expect(response.body.make).toEqual(mockVehicle.make);
      expect(response.body.model).toEqual(mockVehicle.model);
      expect(response.body.type).toEqual('car');      
      expect(response.body.garageId).toEqual(mockVehicle.garageId.toString());
      expect(response.body.profileId).toEqual(mockVehicle.profileId.toString());
    });

    test('POST 400 for trying to post a vehicle with a bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/vehicles`)
          .set('Authorization', 'Bearer THISABADTOKEN');
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/vehicles for missing required name', async () => {
      const mockVehicle = {
        // name: faker.name.firstName(),
        make: faker.name.lastName(),
        model: faker.name.lastName(),
        type: 'car',
        garageId: garage._id,                
        profileId: garage.profileId._id,
      };
      try {
        const response = await superagent.post(`${apiUrl}/vehicles`)
          .authBearer(token)
          .send(mockVehicle);
        expect(response.status).toEqual('ignored, should not reach this code.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET VEHICLES ROUTE TESTING', () => {
    test('GET 200 on successful vehicle retrieval', async () => {
      let mockVehicleData;
      try {
        mockVehicleData = await createVehicleMockPromise();
        console.log('||||||||| MOCKVEHICLEDATA', mockVehicleData);
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/vehicles`)
          .query({ id: mockVehicleData.vehicle._id.toString() })
          .authBearer(token);
      } catch (err) {
        expect(err.status).toEqual('GET that should work.');
      }
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(mockVehicleData.vehicle.name);
      expect(response.body.profileId).toEqual(mockVehicleData.vehicle.profileId.toString());
    });

    test('GET 404 on vehicle profileId not found', async () => {
      let vehicle;
      try {
        vehicle = await createVehicleMockPromise();
      } catch (err) {
        throw err;
      }
      vehicle.profileId = '1234567890';
      let response;
      try {
        response = await superagent.get(`${apiUrl}/vehicles`)
          .query({ id: vehicle.profileId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 401 on bad token', async () => {
      let vehicle;
      try {
        vehicle = await createVehicleMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/vehicles`)
          .query({ id: vehicle.profileId })
          .authBearer('this is not the token we seek');
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 400 on bad query', async () => {
      let vehicle;
      try {
        vehicle = await createVehicleMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/vehicles`)
          .query({ EYEDEE: vehicle.profileId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
