import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';

import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise, removeAccountMockPromise } from './lib/account-mock';
import { createProfileMockPromise } from './lib/profile-mock';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;
beforeAll(async () => { await startServer(); });
afterAll(stopServer);
beforeEach(removeAccountMockPromise);

describe('AUTH router signup (post) tests', () => {
  test('Test function of catch-all route in server', async () => {
    try {
      const response = await superagent.get(`${apiUrl}/notaroute`);
      expect(response.status).toEqual('Bad route should have returned 404');
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });

  test('/api/signup 200 success', async () => {
    const mockAccount = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'thisIsATerriblePassword1234',
    };
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(mockAccount);
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
    } catch (err) {
      expect(err.message).toEqual('Unexpected error testing good signup.');
    }
  });

  test('api/signup 409 conflicting user info', async () => {
    const mockData = await createAccountMockPromise();
    const conflict = mockData.originalRequest;
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(conflict);
      
      expect(response).toEqual('Unexpected status 409 test');
    } catch (err) {
      expect(err.status).toEqual(409);
    }
  });

  test('api/signup 400 missing user info', async () => {
    const mockAccount = {
      username: faker.internet.userName(),
      password: 'thisIsATerriblePassword1234',
    };
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(mockAccount);
      expect(response).toEqual('Unexpected 400 missing email');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });
});

describe('basic AUTH router login (get) tests', () => {
  test('GET 200 to api/login for successful login (no profile) and receipt of a TOKEN', async () => {
    const mockData = await createAccountMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(mockData.account.username, mockData.originalRequest.password); 
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.profileId).toBeDefined();
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid signIn');
    }
  });

  test('GET 200 to api/login for success and profile', async () => {
    const mock = await createProfileMockPromise();
    const username = mock.originalRequest.username; /*eslint-disable-line*/
    const password = mock.originalRequest.password; /*eslint-disable-line*/
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(username, password);
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toBeTruthy();
      expect(response.body.token).toBeTruthy();
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });

  test('GET 400 to /api/login for unsuccesful login with missing  password', async () => {
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth('username', undefined);
      expect(response).toEqual('unexpected status from invalid login ');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });

  test('GET 400 to /api/login for unsuccesful login with missing username', async () => {
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(undefined, 'password');
      expect(response).toEqual('Unexpected good status from missing username test');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });


  test('GET 401 to api/login for good username, bad password', async () => {
    const mockData = await createAccountMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(mockData.account.username, 'nottheirpassword');
      expect(response).toEqual('Unexpected good status from bad password test');
    } catch (err) {
      expect(err.status).toEqual(401);
    }
  });

  test('GET 400 to api/login for bad username, good password', async () => {
    const mockData = await createAccountMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth('wrongUsername', mockData.account.password);
      expect(response).toEqual('Unexpected good status from bad username test');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });
});

describe('AUTH-ROUTER update (put) tests', () => {
  test('200 update existing account email address', async () => {
    const mockData = await createAccountMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/account/email`)
        .authBearer(mockData.token)
        .send({ email: 'newEmail@newEmail.com' });
    } catch (err) {
      expect(err).toEqual('Unexpected error returned on valid udpate');
    }
    expect(response.status).toEqual(200);
  });

  test('200 update existing account password', async () => {
    const mockData = await createAccountMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/account/pw`)
        .authBearer(mockData.token)
        .send({ pw: 'newPassword' });
    } catch (err) {
      expect(err).toEqual('Unexpected error returned on valid udpate');
    }
    expect(response.status).toEqual(200);

    // now try logging in with the new password...
    try {
      response = await superagent.get(`${apiUrl}/login`)
        .auth(mockData.account.username, 'newPassword'); 
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
    } catch (err) {
      expect(err).toEqual('Login with new password failed!');
    }
  });

  test('400 update email bad request', async () => {
    const mockData = await createAccountMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/account/email`)
        .authBearer(mockData.token)
        .send({ EmL: 'newaddr@mail.com' });
      expect(response).toEqual('Unexpected success on bad email update request');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });

  test('404 update email bad url', async () => {
    const mockData = await createAccountMockPromise();
    try {
      await superagent.put(`${apiUrl}/account/emailaddress`)
        .authBearer(mockData.token)
        .send({ email: 'newaddr@mail.com' });
      expect(true).toEqual('Unexpected success on bad email update request');
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });

  test('400 update pw bad request', async () => {
    const mockData = await createAccountMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/account/pw`)
        .authBearer(mockData.token)
        .send({ password: 'newpassword' });
      expect(response).toEqual('Unexpected success on bad email update request');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });

  test('401 update pw bad token', async () => {
    let response;
    try {
      response = await superagent.put(`${apiUrl}/account/pw`)
        .authBearer('badtoken')
        .send({ password: 'newpassword' });
      expect(response).toEqual('Unexpected success on bad email update request');
    } catch (err) {
      expect(err.status).toEqual(401);
    }
  });

  test('409 update email conflict', async () => {
    const mockData1 = await createAccountMockPromise();
    const mockData2 = await createAccountMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/account/email`)
        .authBearer(mockData1.token)
        .send({ email: mockData2.account.email });
      expect(response).toEqual('Unexpected success on bad email update request');
    } catch (err) {
      expect(err.status).toEqual(409);
    }
  });
});
