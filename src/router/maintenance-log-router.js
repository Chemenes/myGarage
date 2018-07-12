import { Router } from 'express';
import HttpErrors from 'http-errors';
import MaintenanceLog from '../model/maintenance-log';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import Attachment from '../model/attachment';

const maintenanceLogRouter = new Router();

maintenanceLogRouter.post('/api/maintenance-logs', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(400, 'POST MAINT LOG ROUTER: invalid request', { expose: false }));
  logger.log(logger.INFO, `.post /api/maintenance-logs req.body: ${request.body}`);

  const qTag = Object.keys(request.query)[0]; /*eslint-disable-line*/
  if (!qTag) {
    return next(new HttpErrors(400, 'ATTACHMENT ROUTER POST ERROR: missing vehicle ID query string', { expose: false }));
  }

  if (!['vehicle', 'v'].includes(qTag)) {
    return next(new HttpErrors(400, `ATTACHMENT ROUTER POST ERROR: invalid tag in query: ${qTag}. Must be "vehicle" or "v".`, { expose: false }));
  }
  MaintenanceLog.init()
    .then(() => {
      const newLog = {
        ...request.body,
        profileId: request.profile._id,
        vehicleId: request.query[qTag],
      };
      return new MaintenanceLog(newLog).save();
    })
    .then((maintenanceLog) => {
      logger.log(logger.INFO, `POST MAINTENANCE_LOG_ROUTER: new maintenance log created with 200 code, ${JSON.stringify(maintenanceLog)}`);
      return response.json(maintenanceLog);
    })
    .catch(next);
  return undefined;
});

maintenanceLogRouter.get('/api/maintenance-logs', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(400, 'GET MAINTENANCE_LOG ROUTER: invalid request', { expose: false }));
  if (!request.query.id) return next(new HttpErrors(400, 'GET MAINTENANCELOG ROUTER: bad query', { expose: false }));

  MaintenanceLog.findById(request.query.id)
    .then((log) => {
      if (!log) return next(new HttpErrors(400, 'MAINTENANCELOG ROUTER GET: log not found', { expose: false }));
      return response.json(log);
    })
    .catch(next);
  return undefined;
});

// update route
maintenanceLogRouter.put('/api/maintenance-logs', bearerAuthMiddleware, (request, response, next) => {
  console.log('########## ', request.profile);
  if (!request.profile) return next(new HttpErrors(400, 'PUT MAINT LOG ROUTER: invalid request', { expose: false }));

  if (!request.query.id) return next(new HttpErrors(400, 'PUT MAINT LOG ROUTER: bad query', { expose: false }));

  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT MAINT LOG ROUTER: Missing request body', { expose: false }));
  
  MaintenanceLog.init()
    .then(() => {
      return MaintenanceLog.findOneAndUpdate({ _id: request.query.id }, request.body);
    })
    .then((log) => {
      return MaintenanceLog.findOne(log._id);
    })
    .then((log) => {
      response.json(log);
    })
    .catch(next);
  return undefined;
});

maintenanceLogRouter.delete('/api/maintenance-logs', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(400, 'DELETE MAINTENANCE-LOG ROUTER: invalid request', { expose: false }));

  if (!request.query.id) return next(new HttpErrors(400, 'DELETE MAINTENANCE ROUTER: bad query', { expose: false }));

  let foundLog;
  MaintenanceLog.init()
    .then(() => {
      return MaintenanceLog.findById(request.query.id);
    })
    .then((log) => {
      foundLog = log;
      // remove all attachments with this logs id
      return Attachment.remove({ parentId: log._id });
    })
    .then(() => {
      // remove the mogoose log object
      return foundLog.remove();
    })
    .then(() => {
      return response.sendStatus(200);
    })
    .catch(next);
  return undefined;
});


export default maintenanceLogRouter;
