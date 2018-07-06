import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


// middleware


// our routes


const app = express();
const PORT = process.env.PORT || 3000;
let server = null;


// third party apps
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// our own api routers or middleware


app.all('*', (request, response) => {
  console.log('returning 404 from the catch/all route');
  return response.sendStatus(404).send('Route Not Registeres');
});


const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI)
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
