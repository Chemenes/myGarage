import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise } from './lib/account-mock';
import { createProfileMockPromise } from './lib/profile-mock';
import { createGarageMockPromise, removeAllResources } from './lib/garage-mock';/*eslint-disable-line*/
import { createVehicleMockPromise } from './lib/vehicle-mock';
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING ROUTER PROFILE', () => {
  let mockData;
  let token;
  let profile;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    // await removeAllResources(); 
    try {
      mockData = await createProfileMockPromise(); 
      profile = mockData.profile; /*eslint-disable-line*/
      token = mockData.token; /*eslint-disable-line*/
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in garage-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('POST GARAGE ROUTES TESTING', () => {
    test('POST 200 to /api/garages for successful garage creation', async () => {
      const mockGarage = {
        name: faker.name.firstName(),
        description: faker.lorem.words(20),
        location: faker.name.firstName(),
      };
      let response;
      
      try {
        response = await superagent.post(`${apiUrl}/garages`)
          .authBearer(token)
          .send(mockGarage);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toEqual(profile._id.toString());
      expect(response.body.name).toEqual(mockGarage.name);
      expect(response.body.description).toEqual(mockGarage.description);
      expect(response.body.location).toEqual(mockGarage.location);
    });

    test('POST 400 to /api/garages for garage with no profile', async () => {
      const mock = await createAccountMockPromise();

      const mockGarage = {
        name: faker.name.firstName(),
        description: faker.lorem.words(20),
        location: faker.name.firstName(),
      };
      let response;
      
      try {
        response = await superagent.post(`${apiUrl}/garages`)
          .authBearer(mock.token)
          .send(mockGarage);
        expect(response).toEqual('Unexpected success where we should have failed on profile.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });


    test('POST 400 for trying to post a garage with a bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/garages`)
          .set('Authorization', 'Bearer THISABADTOKEN');
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/garages for missing required name', async () => {
      const mockGarage = {
        // name: faker.lorem.words(1),
        description: faker.lorem.words(20),
        location: faker.name.firstName(),
        profileId: profile._id,
      };
      try {
        const response = await superagent.post(`${apiUrl}/garages`)
          .authBearer(token)
          .send(mockGarage);
        expect(response.status).toEqual('ignored, should not reach this code.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET GARAGES ROUTE TESTING', () => {
    test('GET 200 on successful garage retrieval', async () => {
      let mockGarageData;
      try {
        mockGarageData = await createGarageMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/garages`)
          .query({ id: mockGarageData.garage._id.toString() })
          .authBearer(token);
      } catch (err) {
        expect(err.status).toEqual('GET that should work.');
      }
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(mockGarageData.garage.name);
      expect(response.body.profileId).toEqual(mockGarageData.garage.profileId.toString());
    });

    test('GET 404 on garage garageId not found', async () => {    
      try {
        const response = await superagent.get(`${apiUrl}/garages`)
          .query({ id: profile._id.toString() })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 400 on no profile found', async () => { 
      const mock = await createAccountMockPromise();

      try {
        const response = await superagent.get(`${apiUrl}/garages`)
          .query({ id: profile._id.toString() })
          .authBearer(mock.token);
        expect(response.status).toEqual('We should not reach this code GET 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 401 on bad token', async () => {
      let garage;
      try {
        garage = await createGarageMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/garages`)
          .query({ id: garage.profileId })
          .authBearer('this is not the token we seek');
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 400 on bad query', async () => {
      let garage;
      try {
        garage = await createGarageMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/garages`)
          .query({ EYEDEE: garage.profileId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('PUT GARAGES ROUTE TESTING', () => {
    test('PUT 200 successful update of existing garage', async () => {
      let garage;
      let attachment;
      try {
        let mock = await createGarageMockPromise();
        garage = mock.garage; /*eslint-disable-line*/
        mock = await createGarageMockPromise();
        attachment = mock.attachment; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      garage.description = faker.lorem.words(10);
      garage.attachments.push(attachment._id);
      let response;
      try {
        response = await superagent.put(`${apiUrl}/garages`)
          .query({ id: garage._id.toString() })
          .authBearer(token)
          .send(garage);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toEqual(garage.profileId.toString());
      expect(response.body.description).toEqual(garage.description);
      expect(response.body.attachments).toHaveLength(2); // one added by garage-mock
    });

    test('PUT 200 successful add vehicle to existing garage', async () => {
      let garage;
      let attachment;
      let vehicle;
      try {
        let mock = await createGarageMockPromise();
        garage = mock.garage; /*eslint-disable-line*/
        mock = await createGarageMockPromise();
        attachment = mock.attachment; /*eslint-disable-line*/
        mock = await createVehicleMockPromise();
        vehicle = mock.vehicle; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      garage.attachments.push(attachment._id);
      garage.vehicles.push(vehicle._id);

      let response;
      try {
        response = await superagent.put(`${apiUrl}/garages`)
          .query({ id: garage._id.toString() })
          .authBearer(token)
          .send(garage);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toEqual(garage.profileId.toString());
      expect(response.body.attachments).toHaveLength(2);
      expect(response.body.vehicles).toHaveLength(1);
      expect(response.body.vehicles[0]).toEqual(vehicle._id.toString());
    });

    test('PUT 404 garage not foud', async () => {
      let response;
      const garage = await createGarageMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/garages`)
          .query({ id: profile._id })
          .authBearer(token)
          .send(garage);
        expect(response).toEqual('PUT should have returned 404...');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('PUT 400 on profile not found', async () => { 
      const mock = await createAccountMockPromise();
      let response;
      const garage = await createGarageMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/garages`)
          .query({ id: profile._id })
          .authBearer(mock.token)
          .send(garage);
        expect(response).toEqual('PUT should have returned 400...');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 400 bad request: missing Query', async () => {
      let response;
      const mock = await createGarageMockPromise();
      const garage = mock.garage; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/garages`)
          .send(garage)
          .authBearer(token);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 400 bad request: Missing body', async () => {
      let response;
      const mock = await createGarageMockPromise();
      const garage = mock.garage; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/garages`)
          .query({ id: garage._id.toString() })
          .authBearer(token);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE GARAGE ROUTE TESTING', () => {
    test('DELETE 200 success', async () => {
      const mock = await createGarageMockPromise();
      const garage = mock.garage; /*eslint-disable-line*/
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/garages`)
          .query({ id: garage._id.toString() })
          .authBearer(token);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err).toEqual('Unexpected error on valid delete test');
      }
    });

    test('DELETE 404 not found', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/garages`)
          .query({ id: profile._id.toString() })
          .authBearer(token);
        expect(response).toEqual('DELETE 404 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('DELETE 400 bad request: missing profile', async () => {
      const mock = await createAccountMockPromise();
      try {
        await superagent.delete(`${apiUrl}/garages`)
          .authBearer(mock.token)
          .query({ id: profile._id.toString() });
        expect(true).toEqual('DELETE 400 missing profile unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('DELETE 400 bad request: missing query', async () => {
      try {
        await superagent.delete(`${apiUrl}/garages`)
          .authBearer(token);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('DELETE 401 bad token', async () => {
      try {
        await superagent.delete(`${apiUrl}/garages`)
          .query({ id: 'thiswontbereached' })
          .authBearer('badtoken');
        expect(true).toEqual('DELETE 401 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('DELETE 400 missing token', async () => {
      try {
        await superagent.delete(`${apiUrl}/garages`)
          .query({ id: 'thiswontbereached' });
        expect(true).toEqual('DELETE 400 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
