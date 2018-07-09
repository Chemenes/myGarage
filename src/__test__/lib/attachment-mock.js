
import faker from 'faker';
import Attachment from '../../model/attachment';

import { createProfileMockPromise, removeAllResources } from './profile-mock';

const createAttachmentMockPromise = async () => {
  const mockData = {};

  const mockProfileData = await createProfileMockPromise();

  mockData.account = mockProfileData.account;
  mockData.profile = mockProfileData.profile;
  mockData.token = mockProfileData.token;

  const attachment = await new Attachment({
    originalName: faker.system.fileName(),
    mimeType: 'mime/type',
    encoding: 'utf-8',
    url: faker.random.image(),
    awsKey: 'multer-hashed-filename.originalName',
    profileId: mockData.profile._id,
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
