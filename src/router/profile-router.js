import { Router } from 'express';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const profileRouter = new Router();

profileRouter.post('/api/profiles', bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/profiles req.body: ${request.body}`);
  if (!request.account) return next(new HttpErrors(400, 'POST PROFILE_ROUTER: invalid request'));

  Profile.init()
    .then(() => {
      return new Profile({
        ...request.body,
        accountId: request.account._id,
      }).save();
    })
    .then((profile) => {
      logger.log(logger.INFO, `POST PROFILE ROUTER: new profile created with 200 code, ${JSON.stringify(profile)}`);
      return response.json(profile);
    })
    .catch(next);
  return undefined;
});

profileRouter.get('/api/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'GET PROFILE ROUTER: invalid request'));
  if (!Object.keys(request.query).length === 0) {
    return Profile.find().populate()
      .then((profiles) => {
        return response.json(profiles);
      })
      .catch(next);
  }

  if (!request.query.id) return next(new HttpErrors(400, 'GET PROFILE ROUTER: bad query'));

  Profile.findOne({ _id: request.query.id })
    .then((profile) => {
      if (!profile) return next(new HttpErrors(400, 'PROFILE ROUTER GET: profile not found'));
      return response.json(profile);
    })
    .catch(next);
  return undefined;
});

export default profileRouter;
