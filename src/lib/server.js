import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import HttpError from 'http-errors';
import logger from './logger';

// middleware
import errorMiddleware from './middleware/error-middleware';
import loggerMiddleware from './middleware/logger-middleware';

// our routes
import authRouter from '../router/auth-router';
import profileRouter from '../router/profile-router';
import attachmentRouter from '../router/attachment-router';
import garageRouter from '../router/garage-router';
import vehicleRouter from '../router/vehicle-router';
import maintenanceLogRouter from '../router/maintenance-log-router';


const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

// cors options needed for use with front-end lab 36-40
const corsOptions = { 
  origin: 'http://localhost:8080',
  credentials: true,
};

// third party apps
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// our own api routers or middleware
app.use(loggerMiddleware);
app.use(authRouter);
app.use(profileRouter);
app.use(garageRouter);
app.use(vehicleRouter);
app.use(maintenanceLogRouter);
app.use(attachmentRouter);

app.all('*', (request, response, next) => {
  logger.log(logger.INFO, 'returning 404 from the catch/all route');
  return next(new HttpError(404, 'Route Not Registered', { expose: false }));
});

app.use(errorMiddleware);

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Server up on ${PORT}`);
      });
    })
    .catch((err) => {
      throw err;
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close();
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
