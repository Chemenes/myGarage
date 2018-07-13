import { Router } from 'express';
import HttpErrors from 'http-errors';
import Vehicle from '../model/vehicle';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import Attachment from '../model/attachment';
import MaintenanceLog from '../model/maintenance-log';

const vehicleRouter = new Router();

vehicleRouter.post('/api/vehicles', bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/vehicles req.body: ${request.body}`);
  if (!request.profile) return next(new HttpErrors(400, 'POST VEHICLE_ROUTER: invalid request', { expose: false }));

  const qTag = Object.keys(request.query)[0]; /*eslint-disable-line*/
  if (!qTag) {
    return next(new HttpErrors(400, 'VEHICLE ROUTER POST ERROR: missing garage ID query string', { expose: false }));
  }

  if (!['garage', 'g'].includes(qTag)) {
    return next(new HttpErrors(400, `VEHICLE ROUTER POST ERROR: invalid tag in query: ${qTag}. Must be "garage" or "g".`, { expose: false }));
  }

  Vehicle.init()
    .then(() => {
      const newV = {
        ...request.body,
        profileId: request.profile._id,
        garageId: request.query[qTag],
      };
      return new Vehicle(newV).save();
    })
    .then((vehicle) => {
      logger.log(logger.INFO, `POST VEHICLE ROUTER: new vehicle created with 200 code, ${JSON.stringify(vehicle)}`);
      return response.json(vehicle);
    })
    .catch(next);
  return undefined;
});

vehicleRouter.get('/api/vehicles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(400, 'GET VEHICLE ROUTER: invalid request', { expose: false }));

  if (!request.query.id) return next(new HttpErrors(400, 'GET VEHICLE ROUTER: bad query', { expose: false }));

  Vehicle.findOne({ _id: request.query.id })
    .then((vehicle) => {
      if (!vehicle) return next(new HttpErrors(404, 'VEHICLE ROUTER GET: vehicle not found', { expose: false }));
      return response.json(vehicle);
    })
    .catch(next);
  return undefined;
});

// update route
vehicleRouter.put('/api/vehicles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(400, 'PUT VEHICLE ROUTER: invalid request', { expose: false }));

  if (!request.query.id) return next(new HttpErrors(400, 'PUT VEHICLE ROUTER: bad query', { expose: false }));

  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT VEHICLE ROUTER: Missing request body', { expose: false }));
  
  Vehicle.init()
    .then(() => {
      return Vehicle.findOneAndUpdate({ _id: request.query.id }, request.body);
    })
    .then((vehicle) => {
      if (!vehicle) return next(new HttpErrors(404, 'PUT VEHICLE ROUTER: vehicle not found', { expose: false }));
      return Vehicle.findOne(vehicle._id);
    })
    .then((vehicle) => {
      response.json(vehicle);
    })
    .catch(next);
  return undefined;
});

vehicleRouter.delete('/api/vehicles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(400, 'DELETE VEHICLE ROUTER: invalid request', { expose: false }));

  if (!request.query.id) return next(new HttpErrors(400, 'DELETE VEHICLE ROUTER: bad query', { expose: false }));

  Vehicle.init()
    .then(() => {
      return Vehicle.remove({ _id: request.query.id });
    })
    .then((result) => {
      // result = { n: <num removed>, ok: 1|0 }
      if (!result.n) return next(new HttpErrors(404, 'DELETE VEHICLE ROUTER: garage ID not found', { expose: false }));
      return Attachment.remove({ vehicleId: request.query.id });
    })
    .then(() => {
      return MaintenanceLog.remove({ vehicleId: request.query.id });
    })
    .then(() => {
      return response.sendStatus(200);
    })
    .catch(next);
  return undefined;
});


export default vehicleRouter;
