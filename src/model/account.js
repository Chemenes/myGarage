import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jsonWebToken from 'jsonwebtoken';
import HttpErrors from 'http-errors';

const HASH_ROUNDS = 4;
const TOKEN_SEED_LENGTH = 12;

const accountSchema = mongoose.Schema({
  passwordHash: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  tokenSeed: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

accountSchema.methods.verifyPasswordPromise = function verifyPasswordPromise(password) {
  return bcrypt.compare(password, this.passwordHash)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      throw new HttpErrors(500, `ERROR CREATING TOKEN: ${JSON.stringify(err)}`, { expose: false });
    });
};

accountSchema.methods.createTokenPromise = function createTokenPromise() {
  this.tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
  return this.save()
    .then((updatedAccount) => {
      return jsonWebToken.sign({ accountId: updatedAccount._id, tokenSeed: updatedAccount.tokenSeed }, process.env.SECRET);
    })
    .catch((err) => {
      throw new HttpErrors(500, `ERROR SAVING ACCOUNT or ERROR WITH JWT: ${JSON.stringify(err)}`, { expose: false });
    });
};

const skipInit = process.env.NODE_ENV === 'development';

const Account = mongoose.model('Account', accountSchema, 'accounts', skipInit);

Account.create = (username, email, password) => {
  return bcrypt.hash(password, HASH_ROUNDS)
    .then((passwordHash) => {
      password = null; /*eslint-disable-line*/
      const tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
      return new Account({
        username,
        email,
        passwordHash,
        tokenSeed,
      }).save();
    });
};

export default Account;
