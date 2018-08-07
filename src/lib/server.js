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
import googleOauthRouter from '../router/google-oauth-router';
import profileRouter from '../router/profile-router';
import attachmentRouter from '../router/attachment-router';
import garageRouter from '../router/garage-router';
import vehicleRouter from '../router/vehicle-router';
import maintenanceLogRouter from '../router/maintenance-log-router';


const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

// cors options needed for use with front-end lab 36-40
// const corsOptions = { 
//   origin: 'http://localhost:8080',
//   credentials: true,
// };
const corsOptions = {
  // origin: process.env.CORS_ORIGINS,
  // "origin" defines what front end domains are permitted to access our API, we need to implement this to prevent any potential attacks
  origin: (origin, cb) => {
    console.log('server origin:', origin);
    if (!origin) {
      // assume Google API or Cypress
      cb(null, true);
    // } else if (process.env.CORS_ORIGINS.includes(origin)) {
    } else if (origin.includes(process.env.CORS_ORIGINS)) {
      console.log('server origin accepted by .includes code');
      cb(null, true);
    } else {
      cb(new Error(`${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Configures the Access-Control-Allow-Credentials CORS header. Set to true to pass the header, otherwise it is omitted.
};
// third party apps
// app.use(cors(corsOptions));

// cors middleware function from https://jonathanmh.com/how-to-enable-cors-in-express-js-node-js/
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });
// breaks localhost connection

// here's the cors docs implementation:
// const whitelist = ['http://localhost:8080', 'http://mygarage-frontend.herokuapp.com'];
const whitelist = JSON.parse(process.env.CORS_ORIGINS);
console.log('server origins whitelist', whitelist);
const corsOptions2 = {
  origin: (origin, callback) => {
    console.log('server origin:', origin);
    if (whitelist.indexOf(origin) !== -1) {
      console.log('server origin passes whitelist.indexOf');
      callback(null, true);
    } else {
      console.log('server origin fails: not allowed');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.options('*', cors(corsOptions2));
app.use(cors(corsOptions2));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// our own api routers or middleware
app.use(loggerMiddleware);
app.use(authRouter);
app.use(googleOauthRouter);
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
