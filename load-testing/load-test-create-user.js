'use strict';

const faker = require('faker');
const uuid = require('uuid/v4');
const loadTestHelpers  = module.exports = {};

loadTestHelpers.create = (requestParams, context, ee, next) => {
  // properties from my account schema
  context.vars.username = faker.internet.userName() + uuid();
  context.vars.email = faker.internet.email() + uuid();
  context.vars.password = faker.internet.password();

  // properties from my profile schema
  context.vars.bio = faker.lorem.words(10);
  context.vars.firstName = faker.name.firstName() + uuid();
  context.vars.lastName = faker.name.lastName();

  // properties of garage
  context.vars.name = faker.lorem.words(3);
  context.vars.location = faker.address.city();
  context.vars.description = faker.lorem.words(10);

  // vehicle properties
  context.vars.carName = faker.name.firstName();
  context.vars.carMake = faker.name.lastName();
  context.vars.carModel = faker.name.suffix();

  // maintenence log properties
  context.vars.logDesc = faker.lorem.words(5);

  return next();
}

loadTestHelpers.ctx = {};

// afterResponse used on /api/signup to capture token
loadTestHelpers.saveData = (requestParams, response, context, ee, next) => {
  loadTestHelpers.ctx = {
    username: context.vars.username,
    password: context.vars.password,
  };
  return next();
}


loadTestHelpers.retrieveData = (requestParams, context, ee, next) => {
  context.vars.b64 = Buffer.from(`${loadTestHelpers.ctx.username}:${loadTestHelpers.ctx.password}`).toString('base64');
  return next();
}
