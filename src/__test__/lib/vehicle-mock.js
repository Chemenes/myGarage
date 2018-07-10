import faker from 'faker';
import Vehicle from '../../model/vehicle';
import { createGarageMockPromise } from './garage-mock';

const createVehicleMockPromise = async () => {
  const mockData = {};

  const mockGarageData = await createGarageMockPromise();
  mockData.garage = mockGarageData.garage;
  mockData.profile = mockGarageData.profile;
  mockData.token = mockGarageData.token;

  const vehicle = await new Vehicle({
    name: faker.name.firstName(),
    make: faker.name.firstName(),
    model: faker.name.firstName(),
    type: 'car',
    garageId: mockGarageData.garage._id,
    profileId: mockGarageData.profile._id,
  }).save();

  mockData.vehicle = vehicle;

  return mockData;
};

const removeVehicleMockPromise = () => {
  return Promise.all([
    Vehicle.remove(),
  ]);
};

export { createVehicleMockPromise, removeVehicleMockPromise };
