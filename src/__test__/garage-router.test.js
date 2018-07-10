import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createProfileMockPromise } from './lib/profile-mock';
import { createGarageMockPromise, removeAllResources } from './lib/garage-mock';/*eslint-disable-line*/
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
        profileId: profile._id,
      };
      let response;
      console.log('$$$$$$ MOCK GARAGE ', mockGarage);
      
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

    test('GET 404 on garage profileId not found', async () => {
      let garage;
      try {
        garage = await createGarageMockPromise();
      } catch (err) {
        throw err;
      }
      garage.profileId = '1234567890';
      let response;
      try {
        response = await superagent.get(`${apiUrl}/garages`)
          .query({ id: garage.profileId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(404);
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
});
