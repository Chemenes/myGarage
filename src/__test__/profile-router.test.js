import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise } from './lib/account-mock';
// import { createAttachmentMockPromise } from './lib/attachment-mock';
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
        accountId: account._id,
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
      const mockProfile = await createProfileMockPromise();
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(mockProfile.token);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body.firstName).toEqual(mockProfile.profile.firstName);
    });

    test('GET 400 on profile not found', async () => {
      const mock = await createAccountMockPromise();
      try {
        const response = await superagent.get(`${apiUrl}/profiles`)/*eslint-disable-line*/
          .authBearer(mock.token);
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 404 on profile not found', async () => {
      const mock = await createAccountMockPromise();
      try {
        const response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(mock.token);
        expect(response).toEqual('GET profile should have failed with 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 401 on bad token', async () => {
      let profile;
      try {
        const mock = await createProfileMockPromise();
        profile = mock.profile; /*eslint-disable-line*/
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
  });

  describe('PUT PROFILES ROUTE TESTING', () => {
    test('PUT 200 successful update of existing profile', async () => {
      const mock = await createProfileMockPromise();
      let response;
      // now change one property of the profile and update it.
      try {
        response = await superagent.put(`${apiUrl}/profiles`)
          .authBearer(mock.token)
          .send({ bio: 'this is our updated bio' });
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.accountId).toEqual(mock.profile.accountId.toString());
      expect(response.body.bio).toEqual('this is our updated bio');
    });

    test('PUT 400  update of existing profile without body', async () => {
      const mock = await createProfileMockPromise();

      try {
        await superagent.put(`${apiUrl}/profiles`)
          .authBearer(mock.token)
          .send({});
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 404 profile not found', async () => {
      const mock = await createAccountMockPromise();

      const profile = await createProfileMockPromise();
      try {
        const response = await superagent.put(`${apiUrl}/profiles`)
          .authBearer(mock.token)
          .send(profile);
        expect(response).toEqual('PUT should have returned 404...');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('PUT 400 bad request', async () => {
      let response;
      const mock = await createProfileMockPromise();
      const profile = mock.profile; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/profiles`);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE PROFILE ROUTE TESTING', () => {
    test('DELETE 200 success', async () => {
      const mock = await createProfileMockPromise();
      const profile = mock.profile; /*eslint-disable-line*/
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: profile._id.toString() })
          .authBearer(token);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err).toEqual('Unexpected error on valid delete test');
      }
    });

    test('DELETE 404 not found', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: '1234568909876543321' })
          .authBearer(token);
        expect(response).toEqual('DELETE 404 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('DELETE 400 bad request', async () => {
      try {
        await superagent.delete(`${apiUrl}/profiles`)
          .authBearer(token);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('DELETE 401 bad token', async () => {
      try {
        await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: 'thiswontbereached' })
          .authBearer('badtoken');
        expect(true).toEqual('DELETE 401 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('DELETE 400 missing token', async () => {
      try {
        await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: 'thiswontbereached' });
        expect(true).toEqual('DELETE 400 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
