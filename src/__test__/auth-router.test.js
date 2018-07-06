import superagent from 'superagent';
import faker from 'faker';

import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise, removeAccountMockPromise } from './lib/account-mock';


const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('AUTH router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(removeAccountMockPromise);

  test('POST 200 to /api/signup for successful account creation and receipt of a TOKEN', () => {
    const mockAccount = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'thisIsATerriblePassword1234',
    };
    return superagent.post(`${apiUrl}/signup`)
      .send(mockAccount)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('POST 409 to api/signup conflicting user info', () => {
    let conflict;
    return createAccountMockPromise()
      .then((mockData) => {
        conflict = mockData.originalRequest;
        return superagent.post(`${apiUrl}/signup`)
          .send(conflict); // this is how we send authorization headers via REST/HTTP
      })
      .then((response) => {
        // When I login, I get a 200 status code and a TOKEN
        expect(response.status).toEqual(409);
        expect(response.body.token).toBeTruthy();
        // expect(response.body.token).toEqual(token);
      })
      .catch((err) => {
        expect(err.status).toEqual(409);
      });
  });

  test('POST 400 to api/signup missing user info', () => {
    const mockAccount = {
      username: faker.internet.userName(),
      // email: faker.internet.email(),
      password: 'thisIsATerriblePassword1234',
    };
    return superagent.post(`${apiUrl}/signup`)
      .send(mockAccount)
      .then((response) => {
        throw response;
        // expect(response.status).toEqual(200);
        // expect(response.body.token).toBeTruthy();
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('GET 200 to api/login for successful login and receipt of a TOKEN', () => {
    // in order to login, we need to create a mock account first
    // let token;
    return createAccountMockPromise()
      .then((mockData) => {
        // token = mockData.token; 
        return superagent.get(`${apiUrl}/login`)
          .auth(mockData.account.username, mockData.originalRequest.password); // this is how we send authorization headers via REST/HTTP
      })
      .then((response) => {
        // When I login, I get a 200 status code and a TOKEN
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
        // expect(response.body.token).toEqual(token);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('GET 400 to /api/login for unsuccesful login with bad username and password', () => {
    return superagent.get(`${apiUrl}/login`)
      .auth('bad username', 'bad password')
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('GET 400 to api/login for good username, bad password', () => {
    // in order to login, we need to create a mock account first
    // let token;
    return createAccountMockPromise()
      .then((mockData) => {
        // token = mockData.token; 
        return superagent.get(`${apiUrl}/login`)
          .auth(mockData.account.username, 'nottheirpassword');
      })
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('GET 400 to api/login for bad username, good password', () => {
    // in order to login, we need to create a mock account first
    // let token;
    return createAccountMockPromise()
      .then((mockData) => {
        return superagent.get(`${apiUrl}/login`)
          .auth('nottherightusername', mockData.account.password);
      })
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });
});
