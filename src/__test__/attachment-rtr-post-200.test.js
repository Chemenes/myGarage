'use strict';

import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { startServer, stopServer } from '../lib/server';
import { createAttachmentMockPromise, removeAttProfAccntMock } from './lib/attachment-mock';

bearerAuth(superagent);

const testFile = `${__dirname}/asset/r1200.jpg`;
const apiUrl = `http://localhost:${process.env.PORT}/api/attachments`;

describe('TESTING ROUTES AT /api/attachments', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(async () => {
    await removeAttProfAccntMock();
  });

  describe('POST ROUTES TO /api/attachments', () => {
    test('POST 200', async () => {
      let token;
      let profile;
      try {
        const mockData = await createAttachmentMockPromise();
        token = mockData.token; /*eslint-disable-line*/
        profile = mockData.profile; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      try {
        const response = await superagent.post(apiUrl)
          .authBearer(token)
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ profile: profile._id.toString() });
        expect(response.status).toEqual(200);
        expect(response.body.originalName).toEqual('r1200.jpg');
        expect(response.body._id).toBeTruthy();
        expect(response.body.url).toBeTruthy();
        // Object.assign(attachment, response.body);
      } catch (err) {
        expect(err).toEqual('POST 200 attachment unexpected error');
      }
      return undefined;
    });
  });
});
