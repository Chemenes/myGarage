import faker from 'faker';
import Account from '../../model/account';

const createAccountMockPromise = async () => {
  const mockData = {};
  const originalRequest = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.lorem.words(5),
  };

  const account = await Account.create(originalRequest.username, originalRequest.email, originalRequest.password);
  mockData.originalRequest = originalRequest;
  mockData.account = account;

  const token = await account.createTokenPromise();
  mockData.token = token; 

  const foundAccount = await Account.findById(mockData.account._id);
  mockData.account = foundAccount;
  return mockData;
};

const removeAccountMockPromise = () => Account.remove({});

export { createAccountMockPromise, removeAccountMockPromise };
