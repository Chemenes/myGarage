import multer from 'multer';
import { Router } from 'express';
import HttpErrors from 'http-errors';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import Attachment from '../model/attachment';
import { s3Upload, s3Remove } from '../lib/s3';
import logger from '../lib/logger';

const multerUpload = multer({ dest: `${__dirname}/../temp` });

const attachmentRouter = new Router();

attachmentRouter.post('/api/attachments', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  console.log('####### POST request.body', request.body);
  console.log('####### POST request.files', request.files);
  if (!request.account) return next(new HttpErrors(401, 'ATTACHMENT ROUTER POST ERROR: not authorized'));
  if (request.files.length !== 1) {
    return next(new HttpErrors(400, 'ATTACHMENT ROUTER POST ERROR: invalid request'));
  }
  const [file] = request.files;

  logger.log(logger.INFO, `ATTACHMENT ROUTER POST: valid file ready to to upload: ${JSON.stringify(file, null, 2)}`);

  const key = `${file.filename}.${file.originalname}`;
  console.log('##### POST calling s3Upload with', file.path, key);
  return s3Upload(file.path, key)
    .then((url) => {
      logger.log(logger.INFO, `ATTACHMENT ROUTER POST: received a valid URL from Amazon S3: ${url}`);
      return new Attachment({
        originalName: file.originalname,
        encoding: file.encoding,
        mimeType: file.mimetype,
        url,
        awsKey: key,
        profileId: request.profile._id,
      }).save();
    })
    .then((newAttachment) => {
      logger.log(logger.INFO, `ATTACHMENT ROUTER POST: new attachment created: ${JSON.stringify(newAttachment, null, 2)}`);
      return response.json(newAttachment);
    })
    .catch(next); 
});

attachmentRouter.get('/api/attachments/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.account) return next(new HttpErrors(401), 'ATTACHMENT ROUTER GET: invalid request');
  if (!request.params.id) return next(new HttpErrors(400, 'ATTACHMENT ROUTER GET: no id provided'));
  return Attachment.findById(request.params.id)
    .then((attachment) => {
      if (!attachment) return next(new HttpErrors(404, 'ATTACHMENT ROUTER GET: no attachment found in database'));
      logger.log(logger.INFO, `ATTACHMENT ROUTER GET: successfully found attachment ${JSON.stringify(attachment, null, 2)}`);
      return response.json(attachment);
    })
    .catch(next);
});

attachmentRouter.delete('/api/attachments/:id?', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(401), 'ATTACHMENT ROUTER DELETE: invalid request');
  if (!request.params.id) return next(new HttpErrors(400, 'ATTACHMENT ROUTER DELETE: no id provided'));
  return Attachment.findById(request.params.id)
    .then((attachment) => {
      if (!attachment) return next(new HttpErrors(404, 'ATTACHMENT ROUTER DELETE: attachment not found in database'));
      const key = attachment.awsKey;
      return s3Remove(key);
    })
    .then((result) => {
      logger.log(logger.INFO, `ATTACHMENT ROUTER DELETE: successfully deleted book cover ${JSON.stringify(result, null, 2)}`);
      return response.json(result);
    })    
    .catch(next);
});

export default attachmentRouter;
