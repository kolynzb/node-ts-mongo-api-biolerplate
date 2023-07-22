import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '@utils/errors/appError.util';
import catchAsync from '@utils/errors/catchAsync.util';
import { RequestWithUser } from '@interfaces/user.interface';
import { decodedJwt, verifyAccessToken } from '@utils/auth/jwt.util';
import User, { UserDocument } from 'src/models/user.model';
import HttpStatusCodes from '@utils/api/httpStatusCode.util';

/**
 * Middleware to protect routes and verify user authentication.
 * If the user is authenticated, it adds the user object to the request body.
 * If the user is not authenticated or the token is invalid, it returns an error response.
 *
 * @throws {AppError} If the user is not authenticated or the token is invalid
 */
export const protect = catchAsync(async (req: RequestWithUser, res: Response, next: NextFunction) => {
  let userAccessToken;

  if (req.headers.authorization || req.headers.authorization?.startsWith('Bearer ')) {
    userAccessToken = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    userAccessToken = req.cookies.accessToken;
  }

  if (!userAccessToken) return next(new AppError('Unauthorized Please Login', HttpStatusCodes.UNAUTHORIZED));

  const decoded = verifyAccessToken(userAccessToken);

  const currentUser = await User.findById((decoded as decodedJwt).id);

  if (!currentUser)
    return next(new AppError('The user belonging to the token no longer exists', HttpStatusCodes.UNAUTHORIZED));

  // Check if user has recently changed there password after token was issued
  if (currentUser.wasPasswordChanged((decoded as JwtPayload)?.iat as number))
    return next(new AppError('User recently changed password! Please log in again.', HttpStatusCodes.UNAUTHORIZED));

  // Add user to request body
  (req as RequestWithUser).user = currentUser;
  return next();
});

/**
 * Middleware function that checks if user has one of the required roles
 *
 * @param  role - the allowed user role(s)
 *
 * @returns middleware function
 * @example
 * ```
 * // for single role
 * router.get('/protected-route', restrictedTo(UserRole.Admin), async (req: Request, res: Response) => {});
 * // for multiple roles
 * router.get('/protected-route', restrictedTo([UserRole.Admin,UserRole.User]), async (req: Request, res: Response) => {});
 * ```
 */

export const restrictedTo =
  (roles: UserDocument['role'] | UserDocument['role'][]) => (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as RequestWithUser).user;
    const userRoles = Array.isArray(currentUser?.role) ? currentUser?.role : [currentUser?.role];
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    const isAuthorized = allowedRoles.some((role) => userRoles?.includes(role as UserDocument['role']));
    if (!isAuthorized) {
      return next(new AppError('Unauthorized to access this resource', HttpStatusCodes.FORBIDDEN));
    }

    return next();
  };
