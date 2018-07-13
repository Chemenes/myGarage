import fs from 'fs-extra';
import logger from './logger';


const s3Upload = (path, key) => {
  const aws = require('aws-sdk');
  const amazonS3 = new aws.S3();
  const uploadOptions = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ACL: 'public-read',
    Body: fs.createReadStream(path),
  };

  let s3response;
  return amazonS3.upload(uploadOptions).promise()
    .then((response) => {
      s3response = response;
      logger.log(logger.INFO, `RECEIVED RESPONSE FROM AWS: ${JSON.stringify(response, null, 2)}`);
      console.log('aaaaaaaa s3Uld path', path);
      return fs.remove(path);
    })
    .then(() => s3response.Location)
    .catch((err) => {
      console.log('aaaaaaaa (error) s3Uld path', path);
      return fs.remove(path)
        .then(() => Promise.reject(err))
        .catch(fsErr => Promise.reject(fsErr)); 
    });
};

const s3Remove = (key) => {
  const aws = require('aws-sdk');
  const amazonS3 = new aws.S3();
  const removeOptions = {
    Key: key,
    Bucket: process.env.AWS_BUCKET,
  };
  return amazonS3.deleteObject(removeOptions).promise();
};

export { s3Upload, s3Remove };
