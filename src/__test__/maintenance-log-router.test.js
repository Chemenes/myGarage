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
      try {
        response = await superagent.put(`${apiUrl}/maintenance-logs`)
          .query({ id: maintLog._id.toString() })
          .authBearer(token)
          .send(maintLog);
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

  describe('POST MAINT LOG ROUTE TESTING', () => {
    test('POST 200 to /api/maintenance-logs for successful log creation', async () => {
      const mockMaintenanceLog = {
        description: faker.lorem.words(5),
        dateOfService: new Date(),
        vehicleId: mockData.vehicle._id,                
        profileId: mockData.vehicle.profileId,
      };
      let response;
      try {
        response = await superagent.post(`${apiUrl}/maintenance-logs`)
          .authBearer(mockData.token)
          .send(mockMaintenanceLog);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.description).toEqual(mockMaintenanceLog.description);
      expect(response.body.dateOfService).toBeTruthy(); // date format hard to compare
      expect(response.body.vehicleId).toEqual(mockMaintenanceLog.vehicleId.toString());
      expect(response.body.profileId).toEqual(mockMaintenanceLog.profileId.toString());
    });
    test('POST 400 for trying to post a log with a bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/maintenance-logs`)
          .set('Authorization', 'Bearer THISABADTOKEN');
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/maintenance-logs for missing required description', async () => {
      const mockMaintenanceLog = {
        // description: faker.lorem.words(5),
        dateOfService: new Date(),
        vehicleId: mockData.vehicle._id,                
        profileId: mockData.vehicle.profileId,
      };
      try {
        const response = await superagent.post(`${apiUrl}/vehicles`)
          .authBearer(token)
          .send(mockMaintenanceLog);
        expect(response.status).toEqual('ignored, should not reach this code.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET MAINT LOG ROUTE TESTING', () => {
    test('GET 200 successful GET of existing log', async () => {
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
      try {
        response = await superagent.get(`${apiUrl}/maintenance-logs`)
          .query({ id: maintLog._id.toString() })
          .authBearer(token);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.profileId).toEqual(maintLog.profileId.toString());
      expect(response.body.dateOfService).toBeTruthy(); // date format hard to compare
      expect(response.body.attachments).toHaveLength(1);
    });

    test('GET 404 on LOG profileId not found', async () => {
      let maintLog;
      try {
        maintLog = await createMaintenanceLogMockPromise();
      } catch (err) {
        throw err;
      }
      maintLog.profileId = '1234567890';
      let response;
      try {
        response = await superagent.get(`${apiUrl}/maintenance-logs`)
          .query({ id: maintLog.profileId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 401 on bad token', async () => {
      let maintenanceLog;
      try {
        maintenanceLog = await createMaintenanceLogMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/maintenance-logs`)
          .query({ id: maintenanceLog.profileId })
          .authBearer('this is not the token we seek');
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 400 on bad query', async () => {
      let maintenanceLog;
      try {
        maintenanceLog = await createMaintenanceLogMockPromise();
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.get(`${apiUrl}/maintenance-logs`)
          .query({ EYEDEE: maintenanceLog.profileId })
          .authBearer(token);
        expect(response.status).toEqual('We should not reach this code GET 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
