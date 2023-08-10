import express from 'express';
import authRoutes from '@routes/auth/auth.routes';
import googleAuthRoutes from '@routes/auth/google-auth.routes';
import userRoutes from '@routes/user/user.routes';

export default (app: express.Application): void => {

  /*
   * -------- Authentication  -------
   */
  app.use(`/api/v1/auth/`, authRoutes);
  app.use(`/api/v1/auth/google/`, googleAuthRoutes);
  /*
  * -------- User  -------
  */
  app.use(`/api/v1/users`, userRoutes);

};
