'use strict';

const faker = require('faker');
const uuid = require('uuid/v4');
const loadTestHelpers  = module.exports = {};

loadTestHelpers.create = (requestParams, context, ee, next) => {
  // properties from my account schema
  context.vars.username = faker.internet.userName() + uuid();
  context.vars.email = faker.internet.email() + uuid();
  context.vars.password = faker.internet.password();

  const saved = { username: context.vars.username, password: context.vars.password };
  loadTestHelpers.savedData.push(saved);

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

loadTestHelpers.savedData = [];

// afterResponse used on /api/signup to capture token
loadTestHelpers.saveData = (requestParams, response, context, ee, next) => {
  const saved = { username: context.username, password: context.password };
  loadTestHelpers.savedData.push(saved);
  return next();
}


loadTestHelpers.retrieveData = (requestParams, context, ee, next) => {
  const data = loadTestHelpers.savedData.pop();
  // context.vars.username = data ? data.username : 'nousername';
  // context.vars.password = data ? data.password : 'nopassword';
  // context.vars.b64 = btoa(`${data.username}:${data.password}`);
  context.vars.b64 = data ? Buffer.from(`${data.username}:${data.password}`).toString('base64') : 'gobbledygook';
  return next();
}
