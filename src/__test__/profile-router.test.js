import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise } from './lib/account-mock';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING ROUTER PROFILE', () => {
  let mockData;
  let token;
  let account;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    await removeAllResources();
    try {
      mockData = await createAccountMockPromise(); 
      account = mockData.account; /*eslint-disable-line*/
      token = mockData.token; /*eslint-disable-line*/
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in profile-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('POST PROFILE ROUTES TESTING', () => {
    test('POST 200 to /api/profiles for successful profile creation', async () => {
      const mockProfile = {
        bio: faker.lorem.words(20),
        location: faker.address.city(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        
      };
      let response;
      try {
        response = await superagent.post(`${apiUrl}/profiles`)
          .authBearer(token)
          .send(mockProfile);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.accountId).toEqual(account._id.toString());
      expect(response.body.firstName).toEqual(mockProfile.firstName);
      expect(response.body.lastName).toEqual(mockProfile.lastName);
      expect(response.body.bio).toEqual(mockProfile.bio);
      expect(response.body.location).toEqual(mockProfile.location);
    });

    test('POST 400 for trying to post a profile with a bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/profiles`)
          .set('Authorization', 'Bearer THISABADTOKEN');
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/profiles for missing required firstName', async () => {
      const mockProfile = {
        bio: faker.lorem.words(20),
        location: faker.address.city(),
        // firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };
      try {
        const response = await superagent.post(`${apiUrl}/profiles`)
          .authBearer(token)
          .send(mockProfile);
        expect(response.status).toEqual('ignored, should not reach this code.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET PROFILES ROUTE TESTING', () => {
    test('GET 200 on successfull profile retrieval', async () => {
      let mockProfileData;
      try {
        mockProfileData = await createProfileMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .query({ id: mockProfileData.profile._id.toString() })
          .authBearer(token);
      } catch (err) {
        expect(err.status).toEqual('GET that should work.');
      }
      expect(response.status).toEqual(200);
      expect(response.body.firstName).toEqual(mockProfileData.profile.firstName);
      expect(response.body.accountId).toEqual(mockProfileData.profile.accountId.toString());
    });

    test('GET 404 on profile accountId not found', async () => {
      let profile;
      try {
        profile = await createProfileMockPromise();
      } catch (err) {
        throw err;
      }
      profile.accountId = '1234567890';
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .query({ id: profile.accountId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 401 on bad token', async () => {
      let profile;
      try {
        profile = await createProfileMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .query({ id: profile.accountId })
          .authBearer('this is not the token we seek');
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 400 on bad query', async () => {
      let profile;
      try {
        profile = await createProfileMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .query({ EYEDEE: profile.accountId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
