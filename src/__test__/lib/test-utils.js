import superagent from 'superagent';
import faker from 'faker';

const apiUrl = `http://localhost:${process.env.PORT}/api`;
const testUtils = {};

testUtils.getNewAuthToken = async () => {
  //
  // Create account /api/signup
  //
  const testUsername = faker.internet.userName();
  const testPassword = faker.lorem.words(2);
  const testEmail = faker.internet.email();
  const mockAccount = {
    username: testUsername,
    email: testEmail,
    password: testPassword,
  };
  
  try {
    await superagent.post(`${apiUrl}/signup`)
      .send(mockAccount);
  } catch (err) {
    expect(err).toEqual('Unexpected error testing good signup.');
  }

  //
  // use new account to log in
  //
  let loginResult;  
  try {
    const response = await superagent.get(`${apiUrl}/login`)
      .auth(testUsername, testPassword); 
    loginResult = response.body;
  } catch (err) {
    expect(err.status).toEqual('Unexpected error response from valid signIn');
  }

  return loginResult;
};

export default testUtils;
