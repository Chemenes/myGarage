import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise } from './lib/account-mock';
import { createAttachmentMockPromise } from './lib/attachment-mock';
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

      // now we should be able to get the profile using our login token
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(loginResult.token);
        profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unxpected');
      }
      expect(profileResult.firstName).toEqual(mockProfile.firstName);
    });

    test('GET 404 on profile not found', async () => {
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
      
      let signupResult;
      try {
        const response = await superagent.post(`${apiUrl}/signup`)
          .send(mockAccount);
        expect(response.status).toEqual(200);
        signupResult = response.body;
      } catch (err) {
        expect(err).toEqual('Unexpected error testing good signup.');
      }

      // there's no profile associated with this new account so trying to GET
      // it should fail with a 404 error

      try {
        const response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(signupResult.token);
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
      let profile;
      try {
        const mock = await createProfileMockPromise();
        profile = mock.profile; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      profile.bio = faker.lorem.words(10);
      let response;
      try {
        response = await superagent.put(`${apiUrl}/profiles`)
          .query({ id: profile._id.toString() })
          .authBearer(token)
          .send(profile);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.accountId).toEqual(profile.accountId.toString());
      expect(response.body.bio).toEqual(profile.bio);
    });

    test('PUT 200 successful add attachment to existing profile', async () => {
      let profile;
      let attachment;
      try {
        const mock = await createAttachmentMockPromise();
        profile = mock.profile; /*eslint-disable-line*/
        attachment = mock.attachment; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      profile.attachments.push(attachment._id);
      let response;
      try {
        response = await superagent.put(`${apiUrl}/profiles`)
          .query({ id: profile._id.toString() })
          .authBearer(token)
          .send(profile);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.accountId).toEqual(profile.accountId.toString());
      expect(response.body.attachments).toHaveLength(1);
      expect(response.body.attachments[0]).toEqual(attachment._id.toString());
    });

    test('PUT 404 profile not foud', async () => {
      let response;
      const profile = await createProfileMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/profiles`)
          .query({ id: '123432123551234234' })
          .authBearer(token)
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
        response = await superagent.put(`${apiUrl}/profiles`)
          .query({ id: profile._id.toString() })
          .authBearer(token);
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
