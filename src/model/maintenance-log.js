'use strict';

import mongoose from 'mongoose';
import Vehicle from './vehicle';
import Attachment from './attachment';/*eslint-disable-line*/

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
      if (!vehicle.maintenanceLogs.map(v => v.toString()).includes(log._id.toString())) {
        vehicle.maintenanceLogs.push(log._id);
      }
      return vehicle.save();
    })
    .catch((err) => {
      throw err;
    });
});

maintenanceLogSchema.post('remove', async (log) => {
  Vehicle.findById(log.vehicleId)
    .then((vehicle) => {
      const idx = vehicle.maintenanceLogs.indexOf(log._id);
      vehicle.maintenanceLogs.splice(idx, 1);
    })
    .then(() => {
      // remove all attachments to log
      for (let i = 0; i < log.attachments.length; i++) {
        Attachment.remove({ _id: log.attachments[i] });
      }
    })
    .catch();
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('MaintenanceLog', maintenanceLogSchema, 'maintenancelogs', skipInit);
