import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import AppError from '../errors/appError.util';
import { RequestWithUser } from '@interfaces/user.interface';
import { UserDocument } from 'src/models/user.model';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret';
const COOKIE_EXPIRES_IN = (process.env.JWT_COOKIE_EXPIRES_IN, 10) || 0.0104167;
const REFRESH_COOKIE_EXPIRES_IN = (process.env.REFRESH_COOKIE_EXPIRES_IN, 10) || 7;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export function generateAccessToken(user: UserDocument): string {
  const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  return accessToken;
}

export function generateRefreshToken(user: UserDocument): string {
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return refreshToken;
}

export interface decodedJwt extends JwtPayload {
  id: UserDocument['id'];
}

export function verifyAccessToken(token: string): string | object | JwtPayload | decodedJwt {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (err) {
    return new AppError('Invalid access token', 400);
  }
}

export function verifyRefreshToken(token: string): string | decodedJwt | object {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    return decoded;
  } catch (err) {
    return new AppError('invalid refresh token', 400);
  }
}

export const createSendTokenAndCookie = (
  user: UserDocument,
  statusCode: number,
  req: Request,
  res: Response,
): Response => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateAccessToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  }

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  });
  (req as RequestWithUser).user = user;

  return res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    user,
  });
};
