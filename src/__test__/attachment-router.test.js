'use strict';

import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';

import { startServer, stopServer } from '../lib/server';
import { createAttachmentMockPromise, removeAttProfAccntMock } from './lib/attachment-mock';
import { createAccountMockPromise } from './lib/account-mock';

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
    // await fs.remove(`${__dirname}/../temp/*`);
  });

  // After running the POST tests together I have three temp files left,
  // even though four of the six tests leave a file behind when run 
  // standalone (.only)

  // this test DOES NOT leave a temp file behind
  describe('POST ROUTES TO /api/attachments', () => {
    test('POST 200 to /api/attachments', async () => {
      let response;
      try {
        response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(token)
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ profile: profile._id.toString(), desc: 'A great motorcycle!' });
      } catch (err) {
        expect(err).toEqual('200 expected. error received');
      }
      expect(response.status).toEqual(200);
      expect(response.body.description).toEqual('A great motorcycle!');
      try {
        response = await superagent.get(`http://localhost:${process.env.PORT}/api/profiles`)
          .authBearer(token);
      } catch (err) {
        expect(err).toEqual('unexpected profile fetch error');
      }
      expect(response.status).toEqual(200);
      expect(response.body.attachments).toHaveLength(1);
    });

    // this test leaves a temp file behind. Two files left when this test
    // isn't run with the other four "litterers"
    test('POST 401 to /api/attachments missing profile', async () => {
      const mock = await createAccountMockPromise();

      try {
        const response = await superagent.post(`${apiUrl}/attachments`)
          .authBearer(mock.token)
          .field('filename', 'R1200.JPG')
          .attach('attachment', testFile)
          .query({ profile: profile._id.toString() });
        expect(response).toEqual('POST 400 unexpected response');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    // this test leaves a temp file behind. Leaves 2 files behind when not run
    // with the other four
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

    // this test leaves a temp file behind. Not running this test with
    // the four the leave files behind individually leaves three files.
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

    // so does this one. Not running it with the 3 above leaves TWO files behind.
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

    // this one DOES NOT leave a temp file behind
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
        expect(response.body.description).toEqual(attachment.description);
        expect(response.body.profileId).toEqual(attachment.profileId.toString());
        expect(response.body.url).toEqual(attachment.url);
        expect(response.body.awsKey).toEqual(attachment.awsKey);
      } catch (err) {
        expect(err).toEqual('FAILING IN GET 200 POST');
      }
    });

    test('401 GET /api/attachments missing profile', async () => {
      const mock = await createAccountMockPromise();

      try {
        const response = await superagent.get(`${apiUrl}/attachments`)
          .authBearer(mock.token)
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
      const mock = await createAccountMockPromise();

      try {
        const response = await superagent.delete(`${apiUrl}/attachments`)
          .authBearer(mock.token)
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
