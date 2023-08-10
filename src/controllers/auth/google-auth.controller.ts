import { NextFunction, Request, Response } from 'express';

import { generateAccessToken, generateRefreshToken } from '@utils/auth/jwt.util';
import GoogleAuthService from '@services/auth/google-auth.service';
import AppError from '@utils/errors/appError.util';
import HttpStatusCodes from '@utils/api/httpStatusCode.util';
import { UserDocument } from 'src/models/user.model';

const googleAuthService = new GoogleAuthService();
export default class GoogleAuthController {

  async googleAuthUrl(req: Request, res: Response) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    const url = googleAuthService.getAuthUrl(scopes);
    return res.redirect(url);
  }

  async googleAuthCallback(req: Request, res: Response, next: NextFunction) {
    const code = req.query.code as string;

    try {
      // Exchange authorization code for access and refresh tokens
      const tokens = await googleAuthService.getTokensFromCode(code);

      // Set Google OAuth2 credentials using the access token
      googleAuthService.setCredentials(tokens);

      // Check if the user exists in your database and authenticate the user
      const user = await googleAuthService.authenticate(tokens.id_token as string);

      const accessToken = generateAccessToken(user as UserDocument);
      const refreshToken = generateRefreshToken(user as UserDocument);
      if (user) {
        // If the user exists, generate and return the JWT token
        res.cookie('access_token', accessToken, { httpOnly: true });
        res.cookie('refresh_token', refreshToken, { httpOnly: true });
        return res.status(200).json({ status: 'success', accessToken, refreshToken, user });
      }
      // If the user does not exist, create a new user account in your database
      const newUser = await googleAuthService.signUp(code);

      // Generate and return the JWT token for the new user
      return res.status(200).json({ status: 'success', accessToken, refreshToken, user: newUser });
    } catch (error: any) {
      return next(new AppError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
  }
}
