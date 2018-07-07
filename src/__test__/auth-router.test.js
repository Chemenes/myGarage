import superagent from 'superagent';
import faker from 'faker';

import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise, removeAccountMockPromise } from './lib/account-mock';


const apiUrl = `http://localhost:${process.env.PORT}/api`;
beforeAll(startServer);
afterAll(stopServer);
beforeEach(removeAccountMockPromise);

describe('AUTH router', () => {
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

describe('basic AUTH router Get tests', () => {
  test('GET 200 to api/login for successful login and receipt of a TOKEN', async () => {
    const mockData = await createAccountMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(mockData.account.username, mockData.originalRequest.password); 
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid signIn');
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


  test('GET 400 to api/login for good username, bad password', async () => {
    const mockData = await createAccountMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(mockData.account.username, 'nottheirpassword');
      expect(response).toEqual('Unexpected good status from bad password test');
    } catch (err) {
      expect(err.status).toEqual(400);
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
