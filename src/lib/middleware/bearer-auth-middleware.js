import HttpErrors from 'http-errors';
import jsonWebToken from 'jsonwebtoken';
import { promisify } from 'util';
import Account from '../../model/account';
import logger from '../logger';

const jwtVerify = promisify(jsonWebToken.verify);

export default (request, response, next) => {
  logger.log(logger.INFO, `BEARER AUTH token: ${request.headers.authorization}`);
  if (!request.headers.authorization) return next(new HttpErrors(400, 'BEARER AUTH MIDDLEWARE: no headers auth'));

  const token = request.headers.authorization.split('Bearer ')[1];
  if (!token) return next(new HttpErrors(400, 'BEARER AUTH MIDDLEWARE: no token'));
  return jwtVerify(token, process.env.SECRET)
    .catch((error) => {
      return Promise.reject(new HttpErrors(401, `BEARER AUTH - jsonWebToken error ${JSON.stringify(error)}`));
    })
    .then((decryptedToken) => {
      /*
        decryptedToken = {
          tokenSeed: asdfast45249wa0dfasfdsadfsdf.....
          iat: some date....
        }
      */
      return Account.findOne({ _id: decryptedToken.accountId });
    })
    .then((account) => {
      if (!account) return next(new HttpErrors(404, 'BEARER AUTH - no account found'));
      request.account = account;
      return next();
    })
    .catch(next);
};
