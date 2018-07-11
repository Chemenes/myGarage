'use strict';

import mongoose from 'mongoose';
import Garage from './garage';

const vehicleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  make: String,
  model: String,
  type: {
    type: String,
    required: true,
    enum: ['car', 'truck', 'boat', 'rv', 'plane', 'atv', 'suv', 'motorcycle'],
    default: 'car',
  },
  maintenanceLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'maintenancelogs',
  }],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attachments',
  }],
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
}, { timestamps: true });

vehicleSchema.post('save', (vehicle) => {
  Garage.findById(vehicle.garageId)
    .then((garage) => {
      if (!garage.vehicles.map(v => v.toString()).includes(vehicle._id.toString())) {
        garage.vehicles.push(vehicle._id);
      }
      return garage.save();
    })
    .catch((err) => {
      throw err;
    });
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Vehicle', vehicleSchema, 'vehicles', skipInit);
