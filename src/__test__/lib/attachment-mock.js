
import faker from 'faker';
import Attachment from '../../model/attachment';
// import Profile from '../../model/profile';
import { createProfileMockPromise, removeAllResources } from './profile-mock';

const createAttachmentMockPromise = async () => {
  const mockData = {};

  const mockProfileData = await createProfileMockPromise();

  mockData.account = mockProfileData.account;
  mockData.profile = mockProfileData.profile;
  mockData.token = mockProfileData.token;
  
  const attachment = await new Attachment({
    originalName: faker.system.fileName(),
    description: 'Description of mocked attachment',
    mimeType: 'mime/type',
    encoding: 'utf-8',
    url: faker.random.image(),
    awsKey: 'multer-hashed-filename.originalName',
    profileId: mockData.profile._id,
    parentId: mockData.profile._id,
    parentModel: 'Profile',
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
