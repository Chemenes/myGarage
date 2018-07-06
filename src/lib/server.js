import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './logger';


// middleware
import errorMiddleware from './middleware/error-middleware';
import loggerMiddleware from './middleware/logger-middleware';

// our routes
import authRouter from '../router/auth-router';

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;


// third party apps
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// our own api routers or middleware
app.use(loggerMiddleware);
app.use(authRouter);

app.all('*', (request, response) => {
  console.log('returning 404 from the catch/all route');
  return response.sendStatus(404).send('Route Not Registered');
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
      server.close(() => {
        console.log('Sever is off');
      });
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
