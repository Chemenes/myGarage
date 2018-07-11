'use strict';

import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { startServer, stopServer } from '../lib/server';
import { createAttachmentMockPromise, removeAttProfAccntMock } from './lib/attachment-mock';

bearerAuth(superagent);

const testFile = `${__dirname}/asset/r1200.jpg`;
const apiUrl = `http://localhost:${process.env.PORT}/api/attachments`;

describe('TESTING ROUTES AT /api/attachments', () => {
  let token;
  // let profile; /*eslint-disable-line*/
  let attachment;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    try {
      const mockData = await createAttachmentMockPromise();
      token = mockData.token; /*eslint-disable-line*/
      attachment = mockData.attachment; /*eslint-disable-line*/
      // profile = mockData.profile; /*eslint-disable-line*/
    } catch (err) {
      throw err;
    }
    return undefined;
  });
  afterEach(async () => {
    await removeAttProfAccntMock();
  });

  describe('POST ROUTES TO /api/attachments', () => {
    test('POST 400 to /api/attachments with bad request', async () => {
      try {
        const response = await superagent.post(apiUrl)
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
        const response = await superagent.post(apiUrl)
          .authBearer('bad-token')
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ vehicle: attachment._id.toString() });
        expect(response).toEqual('POST 401 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });
  });

  describe('GET ROUTES to /api/attachments', () => {
    test('200 GET /api/attachments for successful fetching', async () => {
      try {
        const response = await superagent.get(apiUrl)
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

    test('404 GET /api/attachments with bad id', async () => {
      try {
        const response = await superagent.get(apiUrl)
          .authBearer(token)
          .query({ id: '123456890' });
        expect(response).toEqual('404 GET returned unexpected response');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
  });

  describe('DELETE ROUTES to /api/attachments', () => {
    test('200 DELETE /api/attachments for successful deletion of a attachment', async () => {
      try {
        const response = await superagent.delete(apiUrl)
          .authBearer(token)
          .query({ id: attachment._id.toString() });
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.message).toEqual('FAILING TO GET GOOD STATUS FROM DELETE');
      }
    });

    test('404 DELETE /api/attachments with bad cover id', async () => {
      try {
        const response = await superagent.get(apiUrl)
          .authBearer(token)
          .query({ id: '1234567890' });
        expect(response).toEqual('404 DELETE returned unexpected response');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
    test('DELETE 400 bad request', async () => {
      try {
        await superagent.delete(`${apiUrl}`)
          .authBearer(token);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
