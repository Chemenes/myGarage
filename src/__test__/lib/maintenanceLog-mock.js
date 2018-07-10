import faker from 'faker';
import MaintenanceLog from '../../model/maintenanceLog';
import { createVehicleMockPromise } from './vehicle-mock';


const createMaintenanceLogMockPromise = async () => {
  const mockData = {};

  const mockVehicleData = await createVehicleMockPromise();
 

  const maintenanceLog = await new MaintenanceLog({
    description: faker.lorem.words(3),
    dateOfService: new Date().toISOString(),
    profileId: mockVehicleData.profile._id,
    vehicleId: mockVehicleData._id,
  }).save();

  mockData.maintenanceLog = maintenanceLog;
  return mockData;
};

const removeMaintenceLogMockPromise = () => MaintenanceLog.remove({});
export { createMaintenanceLogMockPromise, removeMaintenceLogMockPromise };
