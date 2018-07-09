'use strict';

import mongoose from 'mongoose';

const attachmentSchema = mongoose.Schema({
  originalName: { // from multer. original filename
    type: String,
    required: true,
  },
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
}, { timestamps: true });


const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Attachment', attachmentSchema, 'attachments', skipInit);
