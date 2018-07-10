import { Router } from 'express';
import HttpErrors from 'http-errors';
import bcrypt from 'bcrypt';
import Account from '../model/account';
import basicAuthMiddleware from '../lib/middleware/basic-auth-middleware';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
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
      return response.json({ token });
    })
    .catch(next);
});

// update account info requires bearer token
authRouter.put('/api/account/:update', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'AUTH-ROUTER: bad request', { expose: false }));

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
      .then((result) => {
        if (!result) return next(new HttpErrors(404, 'AUTH-ROUTER: account ID not found', { expose: false }));
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
    .then((result) => {
      if (!result) return next(new HttpErrors(404, 'AUTH-ROUTER: account ID not found', { expose: false }));
      return response.sendStatus(200);
    })
    .catch(next);
  return undefined;
});

authRouter.get('/api/login', basicAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(400, 'AUTH-ROUTER: invalid request', { expose: false }));
  Account.init()
    .then(() => {
      return request.account.createTokenPromise();
    })
    .then((token) => {
      logger.log(logger.INFO, `AUTH-ROUTER /api/login - responding with a 200 status code and a token ${token}`);
      return response.json({ id: request.account._id, token });
    })
    .catch(next);
  return undefined;
});

export default authRouter;
