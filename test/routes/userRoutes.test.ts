import request from 'supertest';
import app from '@src/app';

describe('Register', () => {
  it('Should Login user successfully and return refresh token ', async () => {
    const response = await request(app)
      .post('/api/v1/login')
      .send({ email: 'test@example.com', username: 'test', password: 'test123#' })
      .expect(200);

    const { token } = response.body.data;
    expect(token).toBeDefined();
    // expect(savedRefreshToken.token).toEqual(refreshToken);
  });
});
