import express from 'express';
import authRoutes from '@routes/auth/auth.routes';
import googleAuthRoutes from '@routes/auth/googleAuth.routes';
import userRoutes from '@routes/user/user.routes';
import userPreferenceRoutes from '@routes/user/userPreference.routes';

export default (app: express.Application): void => {
  // Authentication
  app.use(`/api/v1/auth/`, authRoutes);
  app.use(`/api/v1/auth/google/`, googleAuthRoutes);
  // User
  app.use(`/api/v1/users`, userRoutes);
  app.use(`/api/v1/user-preferences`, userPreferenceRoutes);
};
