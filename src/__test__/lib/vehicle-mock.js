import faker from 'faker';
import Vehicle from '../../model/vehicle';
import { createGarageMockPromise } from './garage-mock';

const createVehicleMockPromise = async () => {
  const mockData = {};

  const mockGarageData = await createGarageMockPromise();
  mockData.garage = mockGarageData.garage;

  const originalRequest = {
    name: faker.name.firstName(),
    make: faker.name.firstName(),
    model: faker.name.firstName(),
    type: 'car',
    garageId: mockGarageData.garage._id,
    profileId: mockGarageData.profile._id,
  };

  const vehicle = await Vehicle.create(originalRequest.name, originalRequest.make, originalRequest.model, originalRequest.type);
  mockData.originalRequest = originalRequest;
  mockData.vehicle = vehicle;

  const token = await vehicle.createTokenPromise();
  mockData.token = token; 

  const foundVehicle = await Vehicle.findById(mockData.vehicle._id);
  mockData.vehicle = foundVehicle;
  return mockData;
};

const removeVehicleMockPromise = () => Vehicle.remove({});

export { createVehicleMockPromise, removeVehicleMockPromise };
