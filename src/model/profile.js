import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
  firstName: { 
    type: String,
    required: true,
  },
  lastName: { type: String },
  bio: String,
  location: String,
  profileImageUrl: String,
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attachments',
  }],
  garages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'garages',
  }],
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Profile', profileSchema, 'profiles', skipInit);
