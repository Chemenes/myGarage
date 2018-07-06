'use strict';

import mongoose from 'mongoose';

const vehicleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'accountId',
  },
  garageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'garageId',
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'profileId',
  },
  type: {
    type: String,
    required: true,
    enum: ['car', 'truck', 'boat', 'rv', 'plane', 'atv', 'motorcycle'],
    default: 'car',
  },
  maintenanceLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'maintenanceLogs',
  }],
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'files',
  }],
}, { timestamps: true });


const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('vehicle', vehicleSchema, 'vehicle', skipInit);