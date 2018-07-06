'use strict';

import mongoose from 'mongoose';

const garageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // this url will map back to the AWS url that AWS S3 gives me after successful upload
  url: {
    type: String,
    required: true,
  },
  // also comes from AWS
  fileName: {
    type: String,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  vehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vehicles',
  }],
}, { timestamps: true });


const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('garage', garageSchema, 'garage', skipInit);