'use strict';

import mongoose from 'mongoose';

const maintenanceLogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'accountId',    
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'vehicleId',
  },
  logs: {
    type: String,
  },
}, { timestamps: true });


const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('maintenanceLog', maintenanceLogSchema, 'maintenanceLog', skipInit);
