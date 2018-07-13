import faker from 'faker';
import Profile from '../../model/profile';
import { createAccountMockPromise, removeAccountMockPromise } from './account-mock';

const createProfileMockPromise = async () => {
  const mockData = {};

  const mockAccountData = await createAccountMockPromise();
  mockData.account = mockAccountData.account;
  mockData.originalRequest = mockAccountData.originalRequest;
  mockData.token = mockAccountData.token;
      
  const mockProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    location: faker.address.city(),
    profileImageUrl: faker.random.image(),
    accountId: mockAccountData.account._id,
  };

  const profile = await new Profile(mockProfile).save();
  mockData.profile = profile;
  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    Profile.remove({}),
    removeAccountMockPromise(),
  ]);
};

export { createProfileMockPromise, removeAllResources };
