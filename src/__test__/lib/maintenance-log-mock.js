import faker from 'faker';
import MaintenanceLog from '../../model/maintenance-log';
import { createVehicleMockPromise } from './vehicle-mock';
import { createAttachmentMockPromise } from './attachment-mock';

const createMaintenanceLogMockPromise = async () => {
  const mockData = {};

  const mockVehicleData = await createVehicleMockPromise();
  const mockAttachmentData = await createAttachmentMockPromise();
  
  const maintenanceLog = await new MaintenanceLog({
    description: faker.lorem.words(3),
    dateOfService: new Date().toISOString(),
    profileId: mockVehicleData.profile._id,
    vehicleId: mockVehicleData.vehicle._id,
    attachments: [mockAttachmentData.attachment._id],
  }).save();

  mockData.maintenanceLog = maintenanceLog;
  return mockData;
};

const removeMaintenceLogMockPromise = () => MaintenanceLog.remove({});
export { createMaintenanceLogMockPromise, removeMaintenceLogMockPromise };
