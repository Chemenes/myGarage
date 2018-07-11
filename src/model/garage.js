'use strict';

import mongoose from 'mongoose';
import Profile from './profile';

const garageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  location: String,
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'profiles',    
  },
  vehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vehicles',
  }],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attachments',
  }],
}, { timestamps: true });

garageSchema.post('save', (garage) => {
  Profile.findById(garage.profileId)
    .then((profile) => {
      if (!profile.garages.map(v => v.toString()).includes(garage._id.toString())) {
        profile.garages.push(garage._id);
      }
      return profile.save();
    })
    .catch((err) => {
      throw err;
    });
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Garage', garageSchema, 'garages', skipInit);
