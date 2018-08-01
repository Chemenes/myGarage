import { Router } from 'express';
import superagent from 'superagent';
import HttpErrors from 'http-errors';

import crypto from 'crypto'; // maybe use this to make password
import jwt from 'jsonwebtoken'
import Account from './model/account';
import logger from '../lib/logger'

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

require('dotenv').config();

const googleOAuthRouter - new Router();

googleOAuthRouter.get('/api/oauth/google', (request, response, next) => {
  
})