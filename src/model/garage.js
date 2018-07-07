'use strict';

import mongoose from 'mongoose';

const garageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'accountId',    
  },
  vehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vehicles',
  }],
}, { timestamps: true });


const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('garage', garageSchema, 'garage', skipInit);
