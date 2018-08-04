import { Router } from 'express';
import HttpErrors from 'http-errors';
import bcrypt from 'bcrypt';
import Account from '../model/account';
import basicAuthMiddleware from '../lib/middleware/basic-auth-middleware';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import profile from '../model/profile';
// import { http } from 'winston';

const HASH_ROUNDS = 4;

const authRouter = new Router();

authRouter.post('/api/signup', (request, response, next) => {
  Account.init()
    .then(() => {
      return Account.create(request.body.username, request.body.email, request.body.password);
    })
    .then((account) => {
      // we want to get rid of the password as early as possible
      delete request.body.password;
      logger.log(logger.INFO, 'AUTH-ROUTER /api/signup: creating token');
      return account.createTokenPromise();
    })
    .then((token) => {
      logger.log(logger.INFO, `AUTH-ROUTER /api/signup: returning a 200 code and a token ${token}`);
      const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
      response.cookie('Lab37ServerToken', token, cookieOptions);
      return response.json({ token });
    })
    .catch(next);
});

// update account info requires bearer token
authRouter.put('/api/account/:update', bearerAuthMiddleware, (request, response, next) => {
  // we won't get here unless we pass bearerAuthMiddleware so we know we'll have a valid account.

  if (!['email', 'pw'].includes(request.params.update)) return next(new HttpErrors(404, `AUTH-ROUTER: route not registered: /api/update/${request.params.update}`));

  if (request.params.update === 'email' && !request.body.email) return next(new HttpErrors(400, 'AUTH-ROUTER: bad request: missing new email address', { expose: false }));

  if (request.params.update === 'pw' && !request.body.pw) return next(new HttpErrors(400, 'AUTH-ROUTER: bad request: missing new password', { expose: false }));

  if (request.params.update === 'email') {
    Account.init()
      .then(() => {
        const newAccount = new Account(request.account);

        newAccount.email = request.body.email;

        return Account.findByIdAndUpdate(newAccount._id, newAccount);
      })
      .then(() => {
        // There's no point testing for account not found because we wouldn't be here of it hadn't been find.
        return response.sendStatus(200);
      })
      .catch(next);
    return undefined;
  } // else update === pw
  Account.init()
    .then(async () => {
      const newAccount = new Account(request.account);    

      const hash = await bcrypt.hash(request.body.pw, HASH_ROUNDS);

      newAccount.passwordHash = hash;

      return Account.findByIdAndUpdate(newAccount._id, newAccount);
    })
    .then(() => {
      return response.sendStatus(200);
    })
    .catch(next);
  return undefined;
});

authRouter.get('/api/login', basicAuthMiddleware, (request, response, next) => {
  let savedToken;
  // if we made it past basicAuthMiddleware we'll have a valid accont object on request.
  Account.init()
    .then(() => {
      return request.account.createTokenPromise();
    })
    .then((token) => {
      savedToken = token;
      return profile.findOne({ accountId: request.account._id });
    })
    .then((newProfile) => {
      logger.log(logger.INFO, 'AUTH-ROUTER /api/login - responding with a 200 status code and a token ');
      const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
      response.cookie('Lab37ServerToken', savedToken, cookieOptions);

      if (newProfile === null) {
        return response.json({ profileId: null, token: savedToken });
      }
      return response.json({ profileId: newProfile._id, token: savedToken });
    })
    .catch(next);
  return undefined;
});

authRouter.delete('/api/login/DELETE', bearerAuthMiddleware, (request, response, next) => {
  // a somewhat hidden route that will allow for deletion of the
  // logged in user's account.  Should delete profile, garages,
  // etc, as well.
  Account.init()
    .then(() => {
      console.log('authRouter.delete reqeust.account', request.account);
      return Account.findByIdAndRemove(request.account._id);
    })
    .then(() => {
      response.sendStatus(200);
    })
    .catch(next);
});

export default authRouter;
