import { NextFunction, Request, Response } from 'express';
import AuthService from '@services/auth/auth.service';
import { LoginUserSchema, RegisterUserSchema, emailSchema, passwordSchema } from '@schemas/auth.schema';
import { createSendTokenAndCookie } from '@utils/auth/jwt.util';
import catchAsync from '@utils/errors/decorators/catchAsync.util';
import { RequestWithUser } from '@interfaces/user.interface';
import { UserDocument } from 'src/models/user.model';

export default class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  @catchAsync()
  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = LoginUserSchema.parse(req.body);

    const user = await this.authService.login(email, password, next);

    return createSendTokenAndCookie(user as UserDocument, 201, req, res);
  }

  @catchAsync()
  async logout(req: Request, res: Response, next: NextFunction) {
    res.cookie('accessToken', 'logout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.cookie('refreshToken', 'logout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    return res.status(200).json({ status: 'success', message: 'Successfully Logged Out' });
  }

  @catchAsync()
  async refresh(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Login Again',
      });
    }
    const accessToken = await this.authService.refreshAccessToken(refreshToken, next);

    return res.status(200).json({
      status: 'success',
      accessToken,
    });
  }

  @catchAsync()
  async register(req: Request, res: Response, next: NextFunction) {
    const { email, password, passwordConfirm } = RegisterUserSchema.parse(req.body);
    const emailUrl = `$req.protocol}://${req.get('host')}/me`;
    const verifyEmailURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyEmail/`;

    const newUser = await this.authService.createUserAndSendWelcomeEmail(
      emailUrl,
      email,
      password,
      passwordConfirm,
      verifyEmailURL,
      next,
    );
    return createSendTokenAndCookie(newUser, 201, req, res);
  }

  @catchAsync()
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    const validatedEmail = emailSchema.parse(email);

    await this.authService.forgotPassword(validatedEmail, next);
    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to email!',
    });
  }

  @catchAsync()
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { otp, newPassword } = req.body;
    const newPass = passwordSchema.parse(newPassword);

    const user = await this.authService.resetPassword(otp, newPass, next);
    return createSendTokenAndCookie(user as UserDocument, 201, req, res);
  }

  @catchAsync()
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const currentUser = (req as RequestWithUser).user;
    const user = await this.authService.changePassword(
      currentPassword,
      newPassword,
      confirmPassword,
      currentUser as UserDocument,
      next,
    );
    return createSendTokenAndCookie(user as UserDocument, 201, req, res);
  }

  @catchAsync()
  async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    const validatedEmail = emailSchema.parse(email);
    const verifyEmailURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyEmail/`;

    await this.authService.sendVerificationEmail(validatedEmail, verifyEmailURL, next);

    return res.status(200).json({
      status: 'success',
      message: 'Token resent to email!',
    });
  }

  @catchAsync()
  async VerifyEmail(req: Request, res: Response, next: NextFunction) {
    const { token } = req.params;

    await this.authService.verifyEmail(token, next);

    return res.status(200).render('emailVerified');
  }

  @catchAsync()
  async changePassword(req: Request, res: Response, next: NextFunction) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    await this.authService.changePassword(
      currentPassword,
      newPassword,
      confirmPassword,
      (req as RequestWithUser).user as UserDocument,
      next,
    );

    return res.status(200).json({
      status: 'success',
      message: 'Password Updated Successfully',
    });
  }
}
