import TestHelpers from '@src/utils/TestsHelpers.util';
import User from '@src/models/user.model';

describe('User Model Tests', () => {
  beforeAll(async () => await TestHelpers.connectDb());
  afterEach(async () => await TestHelpers.clearDb());
  afterAll(async () => await TestHelpers.closeDb());
  it('Create a user and check if password is encrpted', async done => {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123%%%',
      username: 'test',
      passwordConfirm: 'Test123%%%',
    };

    await User.create(testUser);
    const users = await User.find();
    expect(users.length).toBe(1);
    expect(users[0].email).toEqual(testUser.email);
    expect(users[0].username).toEqual(testUser.username);
    expect(users[0].password).not.toEqual(testUser.password);
    done();
  });
});
