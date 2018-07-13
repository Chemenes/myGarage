import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createMaintenanceLogMockPromise } from './lib/maintenance-log-mock';
import { createVehicleMockPromise, removeAllResources } from './lib/vehicle-mock';/*eslint-disable-line*/
import { createAttachmentMockPromise } from './lib/attachment-mock';
import { createAccountMockPromise } from './lib/account-mock';
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('TESTING MAINT LOG ROUTER', () => {
  let mockData;
  let token;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    try {
      mockData = await createVehicleMockPromise(); 
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

    test('PUT 404 log entry not found', async () => {
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

    test('PUT 400 on profile not found', async () => {
      let response;
      let mock = await createVehicleMockPromise();
      const vehicle = mock.vehicle;  /*eslint-disable-line*/
      mock = await createAccountMockPromise();
      const maintenanceLog = await createMaintenanceLogMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/maintenance-logs`)
          .query({ id: vehicle._id })
          .authBearer(mock.token)
          .send(maintenanceLog);
        expect(response).toEqual('PUT should have returned 400...');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 400 for bad query string', async () => {
      const mockMaintenanceLog = {
        description: faker.lorem.words(5),
        dateOfService: new Date(),
      };
      try {
        const response = await superagent.put(`${apiUrl}/maintenance-logs`) /*eslint-disable-line*/
          .authBearer(mockData.token)
          .query({ foo: mockData.vehicle._id.toString() })
          .send(mockMaintenanceLog);
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
      };
      let response;
      try {
        response = await superagent.post(`${apiUrl}/maintenance-logs`)
          .authBearer(mockData.token)
          .query({ vehicle: mockData.vehicle._id.toString() })
          .send(mockMaintenanceLog);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.description).toEqual(mockMaintenanceLog.description);
      expect(response.body.dateOfService).toBeTruthy(); // date format hard to compare
      expect(response.body.vehicleId).toEqual(mockData.vehicle._id.toString());
      expect(response.body.profileId).toBeTruthy();
    });

    test('POST 400 to /api/maintenance-logs for bad query string', async () => {
      const mockMaintenanceLog = {
        description: faker.lorem.words(5),
        dateOfService: new Date(),
      };
      try {
        const response = await superagent.post(`${apiUrl}/maintenance-logs`) /*eslint-disable-line*/
          .authBearer(mockData.token)
          .query({ foo: mockData.vehicle._id.toString() })
          .send(mockMaintenanceLog);
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('POST 400 to /api/maintenance-logs for no query string', async () => {
      const mockMaintenanceLog = {
        description: faker.lorem.words(5),
        dateOfService: new Date(),
      };
      try {
        const response = await superagent.post(`${apiUrl}/maintenance-logs`) /*eslint-disable-line*/
          .authBearer(mockData.token)
          .query()
          .send(mockMaintenanceLog);
      } catch (err) {
        expect(err.status).toEqual(400);
      }
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

    test('POST 400 to /api/maintenance-logs for maintenance log with no profile', async () => {
      const mock = await createAccountMockPromise();

      const mockGarage = {
        name: faker.name.firstName(),
        description: faker.lorem.words(20),
        location: faker.name.firstName(),
      };
      let response;
      
      try {
        response = await superagent.post(`${apiUrl}/maintenance-logs`)
          .authBearer(mock.token)
          .send(mockGarage);
        expect(response).toEqual('Unexpected success where we should have failed on profile.');
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

    test('GET 400 to /api/maintenace-logs for garage with no profile', async () => {
      const mock = await createAccountMockPromise();

      const mockGarage = {
        name: faker.name.firstName(),
        description: faker.lorem.words(20),
        location: faker.name.firstName(),
      };
      let response;
      
      try {
        response = await superagent.get(`${apiUrl}/maintenance-logs`)
          .authBearer(mock.token)
          .send(mockGarage);
        expect(response).toEqual('Unexpected success where we should have failed on profile.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
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

    test('GET 400 on bad query ID', async () => {
      let maintLog;
      try {
        let mock = await createMaintenanceLogMockPromise();  /*eslint-disable-line*/
        maintLog = mock.maintenanceLog; /*eslint-disable-line*/
      } catch (err) {
        throw err;
      }
      maintLog.description = faker.lorem.words(5);
      let response; /*eslint-disable-line*/
      try {
        response = await superagent.get(`${apiUrl}/maintenance-logs`)
          .query({ id: maintLog.profileId.toString() })
          .authBearer(token);
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE MAINTENANCE-LOG ROUTE TESTING', () => {
    test('DELETE 200 success mock with attachment', async () => {
      const mock = await
      createMaintenanceLogMockPromise();
      const maintenanceLog = mock.maintenanceLog; /*eslint-disable-line*/
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/maintenance-Logs`)
          .query({ id: maintenanceLog._id.toString() })
          .authBearer(token);
      } catch (err) {
        expect(err).toEqual('Delete log should have worked. failed!');
      }
      expect(response.status).toEqual(200);
    });
  
    test('DELETE 404 not found', async () => {
      let response;
      try {
        response = await
        superagent.delete(`${apiUrl}/maintenance-Logs`)
          .query({ id: '29084024943020' })
          .authBearer(token);
        expect(response).toEqual('DELETE 404 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('DELETE 400 bad request', async () => {
      try {
        await superagent.delete(`${apiUrl}/maintenance-Logs`)
          .authBearer(token);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
    
    test('DELETE 400 on profile not found', async () => {
      const mock = await createAccountMockPromise();
      const maintenanceLog = await createMaintenanceLogMockPromise();
      try {
        const response = await superagent.delete(`${apiUrl}/maintenance-logs`)
          .query({ id: maintenanceLog.maintenanceLog._id })
          .authBearer(mock.token);
        expect(response).toEqual('DELETE should have returned 400...');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
