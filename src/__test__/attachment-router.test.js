'use strict';

import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createAttachmentMockPromise, removeAttProfAccntMock } from './lib/attachment-mock';

bearerAuth(superagent);

const testFile = `${__dirname}/asset/r1200.jpg`;
const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING ROUTES AT /api/attachments', () => {
  let token;
  let profile; /*eslint-disable-line*/
  let attachment;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    try {
      const mockData = await createAttachmentMockPromise();
      token = mockData.token; /*eslint-disable-line*/
      attachment = mockData.attachment; /*eslint-disable-line*/
      profile = mockData.profile; /*eslint-disable-line*/
    } catch (err) {
      throw err;
    }
    return undefined;
  });
  afterEach(async () => {
    await removeAttProfAccntMock();
  });

  describe('POST ROUTES TO /api/attachments', () => {
    test('POST 200 to /api/attachments', async () => {
      let response;
      try {
        response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(token)
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ profile: profile._id.toString() });
      } catch (err) {
        expect(err).toEqual('200 expected. error received');
      }
      expect(response.status).toEqual(200);
      try {
        response = await superagent.get(`http://localhost:${process.env.PORT}/api/profiles`)
          .authBearer(token);
      } catch (err) {
        expect(err).toEqual('unexpected profile fetch error');
      }
      expect(response.status).toEqual(200);
      expect(response.body.attachments).toHaveLength(1);
    });

    test('POST 401 to /api/attachments missing profile', async () => {
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

      try {
        const response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(loginResult.token)
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ profile: profile._id.toString() });
        expect(response).toEqual('POST 400 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/attachments with missing model info', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(token)
          .field('weDontCareAboutThisField', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ });
        expect(response).toEqual('POST 400 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('POST 401 to /api/attachments with bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer('bad-token')
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ vehicle: attachment._id.toString() });
        expect(response).toEqual('POST 401 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/attachments with bad model name', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(token)
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ notamodel: attachment._id.toString() });
        expect(response).toEqual('POST 400 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('POST 400 to /api/attachments with missing file', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(token)
          .field('filename', 'R1200.JPG')
          // .attach('attachment', testFile)
          .query({ vehicle: attachment._id.toString() });
        expect(response).toEqual('POST 400 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET ROUTES to /api/attachments', () => {
    test('200 GET /api/attachments for successful fetching', async () => {
      try {
        const response = await superagent.get(`${apiUrl}/attachments`)
          .authBearer(token)
          .query({ id: attachment._id.toString() });
        expect(response.status).toEqual(200);
        expect(response.body.originalName).toEqual(attachment.originalName);
        expect(response.body.profileId).toEqual(attachment.profileId.toString());
        expect(response.body.url).toEqual(attachment.url);
        expect(response.body.awsKey).toEqual(attachment.awsKey);
      } catch (err) {
        expect(err).toEqual('FAILING IN GET 200 POST');
      }
    });

    test('401 GET /api/attachments missing profile', async () => {
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

      try {
        const response = await superagent.get(`${apiUrl}/attachments`)
          .authBearer(loginResult.token)
          .query({ id: attachment._id.toString() });
        expect(response).toEqual('400 GET returned unexpected response');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('404 GET /api/attachments with missing query', async () => {
      try {
        const response = await superagent.get(`${apiUrl}/attachments`)
          .authBearer(token);
        expect(response).toEqual('400 GET returned unexpected response');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('404 GET /api/attachments with bad id', async () => {
      try {
        const response = await superagent.get(`${apiUrl}/attachments`)
          .authBearer(token)
          .query({ id: profile._id.toString() });
        expect(response).toEqual('404 GET returned unexpected response');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
  });

  describe('DELETE ROUTES to /api/attachments', () => {
    test('200 DELETE /api/attachments for successful deletion of a attachment', async () => {
      try {
        const response = await superagent.delete(`${apiUrl}/attachments`)
          .authBearer(token)
          .query({ id: attachment._id.toString() });
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.message).toEqual('FAILING TO GET GOOD STATUS FROM DELETE');
      }
    });

    test('401 DELETE /api/attachments missing profile', async () => {
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

      try {
        const response = await superagent.delete(`${apiUrl}/attachments`)
          .authBearer(loginResult.token)
          .query({ id: attachment._id.toString() });
        expect(response).toEqual('Unexpected success deleting w/o profile');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    
    test('404 DELETE /api/attachments with bad attachment id', async () => {
      try {
        const response = await superagent.delete(`${apiUrl}/attachments`)
          .authBearer(token)
          .query({ id: profile._id.toString() });
        expect(response).toEqual('404 DELETE returned unexpected response');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
    
    test('DELETE 400 bad request', async () => {
      try {
        await superagent.delete(`${apiUrl}/attachments`)
          .authBearer(token);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
