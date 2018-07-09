
import faker from 'faker';
import Garage from '../../model/garage';

import { createAttachmentMockPromise, removeAttProfAccntMock } from './attachment-mock';

const createGarageMockPromise = async () => {
  const mockData = {};

  const mockGarageData = await createAttachmentMockPromise();

  mockData.account = mockGarageData.account;
  mockData.profile = mockGarageData.profile;
  mockData.token = mockGarageData.token;
  mockData.attachment = mockGarageData.attachment;

  const garage = await new Garage({
    name: faker.lorem.words(2),
    description: faker.lorem.words(8),
    location: `${faker.address.city()}, ${faker.address.state()}`,
    profileId: mockData.profile._id,
    // vehicles?  Need to mock vehicles first.  
    attachments: [mockData.attachment._id],  
  }).save();

  mockData.garage = garage;

  return mockData;
};

const removeGarAttProfAccntMock = () => {
  return Promise.all([
    Garage.remove(),
    removeAttProfAccntMock(),
  ]);
};

export { createGarageMockPromise, removeGarAttProfAccntMock };
