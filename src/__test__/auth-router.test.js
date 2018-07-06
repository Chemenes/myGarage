'use strict';

import superagent from 'superagent';
import faker from 'faker';

import { startServer, stopServer } from '../lib/server';
import { createAccountMockPromise, removeAccountMockPromise } from './lib/account-mock';

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('basic AUTH router tests', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(removeAccountMockPromise);

  test('200 successful response /api/signup', async () => {
    const mockAccount = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'ahhhhhhh',
    };
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(mockAccount);
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
    } catch (err) {
      expect(err.message).toEqual('unexpected error from api signup');
    }
  });
});
