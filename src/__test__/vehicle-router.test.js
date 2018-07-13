import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
// import tu from './lib/test-utils';
import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise } from './lib/account-mock';
import { createGarageMockPromise } from './lib/garage-mock';
import { createVehicleMockPromise, removeAllResources } from './lib/vehicle-mock';/*eslint-disable-line*/
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING VEHICLE ROUTER', () => {
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
        // garageId: garage._id,                
        // profileId: garage.profileId._id,
      };
      let response;
      
      try {
        response = await superagent.post(`${apiUrl}/vehicles`)
          .authBearer(token)
          .query({ g: garage._id.toString() })
          .send(mockVehicle);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(mockVehicle.name);
      expect(response.body.make).toEqual(mockVehicle.make);
      expect(response.body.model).toEqual(mockVehicle.model);
      expect(response.body.type).toEqual('car');      
      expect(response.body.garageId).toEqual(garage._id.toString());
      expect(response.body.profileId).toEqual(garage.profileId.toString());
    });

    test('POST 400 post vehicle without profile', async () => {
      const mock = await createAccountMockPromise();

      try {
        const response = await superagent.post(`${apiUrl}/vehicles`)
          .authBearer(mock.token)
          .query({ garage: garage._id.toString() });
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('POST 401 for trying to post a vehicle with a bad/missing token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/vehicles`)
          .query({ garage: garage._id })
          .authBearer('THISABADTOKEN');
        expect(response).toEqual('POST 401 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 for bad query', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/vehicles`)
          .query({ foo: garage._id })
          .authBearer(token);
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('POST 400 to /api/vehicles for missing required name', async () => {
      const mockVehicle = {
        // name: faker.name.firstName(),
        make: faker.name.lastName(),
        model: faker.name.lastName(),
        type: 'car',
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

    test('GET 400 on no user profile', async () => {  
      const mock = await createAccountMockPromise();
      const vehicle = await createVehicleMockPromise();
      
      try {
        const response = await superagent.get(`${apiUrl}/vehicles`)
          .query({ id: vehicle.vehicle._id })
          .authBearer(mock.token);
        expect(response.status).toEqual('We should not reach this code GET 400');
      } catch (err) {
        expect(err.status).toEqual(400);
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

    test('GET 400 on vehicle not found', async () => {
      let vehicle;
      try {
        vehicle = await createVehicleMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/vehicles`)
          .query({ id: vehicle.vehicle.profileId.toString() })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(404);
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

  describe('PUT VEHICLES ROUTE TESTING', () => {
    test('PUT 200 successful update of existing vehicle', async () => {
      let vehicle;
      let attachment;
      try {
        let mock = await createVehicleMockPromise();
        vehicle = mock.vehicle; /*eslint-disable-line*/
        mock = await createGarageMockPromise();
        attachment = mock.attachment; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      vehicle.model = faker.lorem.words(2);
      vehicle.attachments.push(attachment._id);
      let response;
      try {
        response = await superagent.put(`${apiUrl}/vehicles`)
          .query({ id: vehicle._id.toString() })
          .authBearer(token)
          .send(vehicle);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toEqual(vehicle.profileId.toString());
      expect(response.body.model).toEqual(vehicle.model);
      expect(response.body.attachments).toHaveLength(1);
    });

    test('PUT 400 no profile', async () => {
      const mock = await createAccountMockPromise();
      const vehicle = await createVehicleMockPromise();
      try {
        const response = await superagent.put(`${apiUrl}/vehicles`)
          .query({ id: vehicle.vehicle._id.toString() })
          .authBearer(mock.token)
          .send(vehicle.vehicle);
        expect(response).toEqual('PUT should have returned 400...');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
            
    test('PUT 404 vehicle not found', async () => {
      let response;
      const vehicle = await createVehicleMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/vehicles`)
          .query({ id: vehicle.vehicle.profileId.toString() })
          .authBearer(token)
          .send(vehicle);
        expect(response).toEqual('PUT should have returned 404...');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('PUT 400 bad query request', async () => {
      let response;
      const mock = await createVehicleMockPromise();
      const vehicle = mock.vehicle; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/vehicles`)
          .query({ foo: vehicle._id.toString() })
          .send(vehicle)
          .authBearer(token);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 400 missing request body', async () => {
      let response;
      const mock = await createVehicleMockPromise();
      const vehicle = mock.vehicle; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/vehicles`)
          .query({ id: vehicle._id.toString() })
          .send({})
          .authBearer(token);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE VEHICLE ROUTE TESTING', () => {
    test('DELETE 200 success', async () => {
      const mock = await createVehicleMockPromise();
      const vehicle = mock.vehicle;/*eslint-disable-line*/
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/vehicles`)
          .query({ id: vehicle._id.toString() })
          .authBearer(token);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err).toEqual('Unexpected error on delete test');
      }
    });

    test('DELETE 400 profile not found', async () => {
      let mock = await createVehicleMockPromise();
      const vehicle = mock.vehicle;/*eslint-disable-line*/
      mock = await createAccountMockPromise();
      try {
        const response = await superagent.delete(`${apiUrl}/vehicles`)
          .query({ id: vehicle._id.toString() })
          .authBearer(mock.token);
        expect(response).toEqual('DELETE 400 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('DELETE 404 not found', async () => {
      const mock = await createVehicleMockPromise();
      const vehicle = mock.vehicle;/*eslint-disable-line*/
      let response;
      try {
        response = await
        superagent.delete(`${apiUrl}/vehicles`)
          .query({ id: vehicle.profileId.toString() })
          .authBearer(token);
        expect(response).toEqual('DELETE 404 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('DELETE 400 bad request', async () => {
      try {
        await superagent.delete(`${apiUrl}/vehicles`)
          .authBearer(token);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
