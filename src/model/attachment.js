'use strict';

import mongoose from 'mongoose';
import Profile from './profile';
import Garage from './garage';
import Vehicle from './vehicle';
import Logs from './maintenance-log'; /*eslint-disable-line*/
import { s3Remove } from '../lib/s3';

const attachmentSchema = mongoose.Schema({
  originalName: { // from multer. original filename
    type: String,
    required: true,
  },
  description: String, // optional
  mimeType: { // from multer. file's mime-type
    type: String,
    required: true,
  },
  encoding: { // from multer. file's encoding
    type: String,
    required: true,
  },
  url: { // from AWS. access file using this link
    type: String,
    required: true,
  },
  // this is the filename on AWS
  // formed from multer's hash filename and originalName
  awsKey: {
    type: String,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  parentModel: {
    type: String,
    required: true,
  },
}, { timestamps: true });

attachmentSchema.post('remove', async (attachment) => {
  // find attachment.parentId and remove attachment._id
  // from it's attachments array
  const models = {
    profile: Profile,
    garage: Garage,
    vehicle: Vehicle,
    maintenancelog: Logs,
  };

  models[attachment.parentModel.toLowerCase()].findById(attachment.parentId)
    .then((parent) => {  
      const idx = parent.attachments.indexOf(attachment._id);
      parent.attachments.splice(idx, 1);
    })
    .then(() => {
      return s3Remove(attachment.awsKey);
    })
    .catch();
});

attachmentSchema.methods.attach = async function attach(model, id) {
  const models = {
    profile: Profile,
    p: Profile,
    garage: Garage,
    g: Garage,
    vehicle: Vehicle,
    v: Vehicle,
    maintenancelog: Logs,
    l: Logs,
  };

  let result;
  models[model].findOne({ _id: id })
    .then((found) => { // result should be a mongoose object
      result = found;
      return result.attachments.push(this._id);
    })
    .then(() => {
      return result.save();
    })
    .catch((err) => {
      throw err;
    });
};

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Attachment', attachmentSchema, 'attachments', skipInit);
