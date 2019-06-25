import multer from 'multer';
// import fs from 'fs-extra';
import { Router } from 'express';
import HttpErrors from 'http-errors';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import Attachment from '../model/attachment';
import { s3Upload, s3Remove } from '../lib/s3';
import logger from '../lib/logger';

const multerUpload = multer({ dest: `${__dirname}/../temp` });

const attachmentRouter = new Router();

const attachmentRouterPostMw = (request, response, next) => {

// attachmentRouter.post('/api/attachments', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  console.log(request.profile, 'request.profile')
  if (!request.profile) return next(new HttpErrors(401, 'ATTACHMENT ROUTER POST ERROR: no profile created.', { expose: false }));

  const modelName = Object.keys(request.query)[0]; /*eslint-disable-line*/
  if (!modelName) {
    return next(new HttpErrors(400, 'ATTACHMENT ROUTER POST ERROR: missing model query', { expose: false }));
  }

  if (!['profile', 'p', 'garage', 'g', 'vehicle', 'v', 'maintenancelog', 'l'].includes(modelName)) {
    return next(new HttpErrors(400, `ATTACHMENT ROUTER POST ERROR: invalid model in query: ${modelName}`, { expose: false }));
  }

  return next();
};

// JV: I believe your multerUpload middleware should appear second after bearerAuth becuase the placement of this middleware is causing the huge ECONNRESET issue back in your tests. If we fail in attachmentRouterPstMw, the next middleware in the chain is multerUpload and that somehow causes the ECONNRESET issues when using the huge file. That said, after applying these changes, we now err out at your "bad token" test because the bad token error moves on to multerUpload, and nothing is handling that error in multerUpload properly, so we continue to get ECONNRESET errors on this test. My advice would be that multerUpload.any be abstracted away to its own piece of middleware, perhaps even be part of attachmentRouterPostMw, and you can handle errors there, i.e. if a token does not get sent properly. 

// JV: A Postman request to send an attachment takes forever on the r1200 image, perhaps you might want to include some validaton to ensure the uploaded image doesn't exceed a certain size. Even though it could potentially be my own personal Internet connection causing this latency, you should write code to cater to as many users as you can, including users with slow internet conncetions who probably shouldn't be permitted to upload huge images. On that note, saving yourself the trouble of saving huge images in your AWS bucket is also beneficial. 
attachmentRouter.post('/api/attachments', bearerAuthMiddleware, multerUpload.any(), attachmentRouterPostMw, (request, response, next) => {
  // JV: checking for a condition if files.length < 1 is probably a better check because this wouldn't hit it if somehow more than 1 file got attached
  if (request.files.length !== 1) {
    return next(new HttpErrors(400, 'ATTACHMENT ROUTER POST ERROR: invalid request, missing file.', { expose: false }));
  }
  const [file] = request.files;

  const modelName = Object.keys(request.query)[0]; /*eslint-disable-line*/
  const description = request.query.desc ? request.query.desc : '';
  logger.log(logger.INFO, `ATTACHMENT ROUTER POST to ${modelName}=${request.query[modelName]}&desc=${description}`);
  logger.log(logger.INFO, `ATTACHMENT ROUTER POST: valid file ready to to upload: ${JSON.stringify(file, null, 2)}`);

  const key = `${file.filename}.${file.originalname}`;

  let savedAttachment;
  return s3Upload(file.path, key)
    .then((url) => {
      logger.log(logger.INFO, `ATTACHMENT ROUTER POST: received a valid URL from Amazon S3: ${url}`);
      return new Attachment({
        originalName: file.originalname,
        description,
        encoding: file.encoding,
        mimeType: file.mimetype,
        url,
        awsKey: key,
        profileId: request.profile._id,
        parentId: request.query[modelName],
        parentModel: modelName,
      }).save();
    })
    .then((newAttachment) => {
      logger.log(logger.INFO, `ATTACHMENT ROUTER POST: new ${modelName} attachment created: ${JSON.stringify(newAttachment, null, 2)}`);
      savedAttachment = newAttachment;
      return newAttachment.attach(modelName, request.query[modelName]);
    })
    .then(() => {
      return response.json(savedAttachment);
    })
    .catch(next); 
});

attachmentRouter.get('/api/attachments', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(401), 'ATTACHMENT ROUTER GET: invalid request: missing profile.', { expose: false });

  if (!request.query.id) {
    return next(new HttpErrors(400, 'ATTACHMENT ROUTER GET ERROR: missing ID query', { expose: false }));
  }
  
  return Attachment.findById(request.query.id)
    .then((attachment) => {
      if (!attachment) return next(new HttpErrors(404, 'ATTACHMENT ROUTER GET: no attachment found in database', { expose: false }));

      logger.log(logger.INFO, `ATTACHMENT ROUTER GET: successfully found attachment ${JSON.stringify(attachment, null, 2)}`);

      return response.json(attachment);
    })
    .catch(next);
});

attachmentRouter.delete('/api/attachments', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(401), 'ATTACHMENT ROUTER DELETE: invalid request', { expose: false });

  if (!request.query.id) {
    return next(new HttpErrors(400, 'ATTACHMENT ROUTER POST ERROR: missing model ID query', { expose: false }));
  }
  
  let key;
  return Attachment.findById(request.query.id)
    .then((attachment) => {
      if (!attachment) return next(new HttpErrors(404, 'ATTACHMENT ROUTER DELETE: attachment not found in database', { expose: false }));
      key = attachment.awsKey;
      return attachment.remove();
    })
    .then(() => {
      return s3Remove(key);
    })
    .then(() => {
      logger.log(logger.INFO, 'ATTACHMENT ROUTER DELETE: successfully deleted attachment');
      return response.sendStatus(200);
    })    
    .catch(next);
});

export default attachmentRouter;
