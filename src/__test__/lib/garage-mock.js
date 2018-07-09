
import faker from 'faker';
import Garage from '../../model/garage';

import { createAttachmentMockPromise, removeAttProfAccntMock } from './attachment-mock';

const createGaragetMockPromise = async () => {
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
  }).save();

  mockData.attachment = attachment;

  return mockData;
};

const removeAttProfAccntMock = () => {
  return Promise.all([
    Attachment.remove(),
    removeAllResources(),
  ]);
};

export { createAttachmentMockPromise, removeAttProfAccntMock };
