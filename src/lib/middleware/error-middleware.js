'use strict';

import logger from '../logger';

// in express, error handling middleware must follow this exact signature of four args, where the first arg is considered the error, and is followed by request, response, next
export default (error, request, response, next) => { /*eslint-disable-line*/
  // I might have a status property
  if (error.status) {
    logger.log(logger.ERROR, `ERROR MIDDLEWARE: Responding with a ${error.status} code and message ${error.message}`);
    return response.sendStatus(error.status);
  }

  // if we make it this far, it's another type of error potentially related to MongoDB

  const errorMessage = error.message.toLowerCase();

  switch (true) {
    case (errorMessage.includes('validation failed')):
      logger.log(logger.ERROR, `ERROR MIDDLEWARE: Responding with a 400 code ${errorMessage}`);
      return response.sendStatus(400);
    case (errorMessage.includes('unauthorized')):
      logger.log(logger.ERROR, `ERROR MIDDLEWARE: Responding with a 401 code ${errorMessage}`);
      return response.sendStatus(401);
    case errorMessage.includes('objectid failed'):
      logger.log(logger.ERROR, `ERROR MIDDLEWARE: Responding with a 404 status code ${errorMessage}`);
      return response.sendStatus(404);
    case (errorMessage.includes('duplicate key')):
      logger.log(logger.ERROR, `ERROR MIDDLEWARE: Responding with a 409 code ${errorMessage}`);
      return response.sendStatus(409);
    default:
      logger.log(logger.ERROR, `ERROR MIDDLEWARE: Responding with a 500 code ${JSON.stringify(error)}`);
      return response.sendStatus(500);
  }
};
