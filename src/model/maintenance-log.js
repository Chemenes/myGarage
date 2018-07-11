'use strict';

import mongoose from 'mongoose';
import Vehicle from './vehicle';

const maintenanceLogSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  dateOfService: Date,
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'profiles',    
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'vehicles',
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attachments',
  }],
}, { timestamps: true });

maintenanceLogSchema.post('save', (log) => {
  Vehicle.findById(log.vehicleId)
    .then((vehicle) => {
      vehicle.maintenanceLogs.push(log._id);
      return vehicle.save();
    })
    .catch((err) => {
      throw err;
    });
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('MaintenanceLog', maintenanceLogSchema, 'maintenancelogs', skipInit);
