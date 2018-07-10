import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createMaintenanceLogMockPromise } from './lib/maintenance-log-mock';
import { createVehicleMockPromise, removeAllResources } from './lib/vehicle-mock';/*eslint-disable-line*/
import { createAttachmentMockPromise } from './lib/attachment-mock';
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING MAINT LOG ROUTER', () => {
  let mockData;
  let token;
  // let vehicle;
  // let profile;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    // await removeAllResources(); 
    try {
      mockData = await createVehicleMockPromise(); 
      // vehicle = mockData.vehicle; /*eslint-disable-line*/
      token = mockData.token; /*eslint-disable-line*/
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in vehicle-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('PUT MAINT LOG ROUTE TESTING', () => {
    test('PUT 200 successful update of existing log', async () => {
      let maintLog;
      let attachment;
      try {
        let mock = await createMaintenanceLogMockPromise();
        maintLog = mock.maintenanceLog; /*eslint-disable-line*/
        mock = await createAttachmentMockPromise();
        attachment = mock.attachment; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      maintLog.description = faker.lorem.words(5);
      maintLog.attachments.push(attachment._id);
      let response;
      console.log('%%%%%%%% PUTing maintLog', JSON.stringify(maintLog, null, 2));
      try {
        response = await superagent.put(`${apiUrl}/maintenance-logs`)
          .query({ id: maintLog._id.toString() })
          .authBearer(token)
          .send(maintLog);
        console.log('%%%%%%% post maintLog PUT body:', JSON.stringify(response.body, null, 2));
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toEqual(maintLog.profileId.toString());
      expect(response.body.dateOfService).toBeTruthy(); // date format hard to compare
      expect(response.body.attachments).toHaveLength(2);
    });

    test('PUT 404 log entry not foud', async () => {
      let response;
      const log = await createMaintenanceLogMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/maintenance-logs`)
          .query({ id: '123432123551234234' })
          .authBearer(token)
          .send(log);
        expect(response).toEqual('PUT should have returned 404...');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('PUT 400 bad request', async () => {
      let response;
      const mock = await createMaintenanceLogMockPromise();
      const log = mock.maintenanceLog; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/maintenance-logs`)
          .query({ id: log._id.toString() })
          .authBearer(token);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 401 bad token', async () => {
      let response;
      const mock = await createMaintenanceLogMockPromise();
      const log = mock.maintenanceLog; /*eslint-disable-line*/
      try {
        response = await superagent.put(`${apiUrl}/maintenance-logs`)
          .query({ id: log._id.toString() })
          .authBearer('badtokenstring')
          .send(log);
        expect(response).toEqual('We should have failed with a 401');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });
  });
});
