import faker from 'faker';
import MaintenanceLog from '../../model/maintenanceLog';
import { createVehicleMockPromise } from './vehicle-mock';


const createMaintenanceLogMockPromise = async () => {
  const mockData = {};

  const mockVehicleData = await createVehicleMockPromise;
 
  const originalRequest = {
    description: faker.lorem.words(3),
    dateOfService: new Date().toISOString(),
    profileId: mockVehicleData.profile._id,
    vehicleId: mockVehicleData._id,
  };
  const maintenanceLog = await MaintenanceLog.create(originalRequest.description, originalRequest.dateOfService, originalRequest.profileId, originalRequest.vehicleId);

  mockData.originalRequest = originalRequest;
  mockData.maintenanceLog = maintenanceLog;

  const token = await maintenanceLog.createTokenPromise();
  mockData.token = token;

  const foundMaintenanceLog = await MaintenanceLog.findById(mockData.maintenanceLog._id);
  mockData.maintenanceLog = foundMaintenanceLog;
  return mockData;
};

const removeMaintenceLogMockPromise = () => MaintenanceLog.remove({});
export { createMaintenanceLogMockPromise, removeMaintenceLogMockPromise };
