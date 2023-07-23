import { NextFunction } from 'express';
import AppError from '@utils/errors/appError.util';
import Email from '@utils/email/email.util';
import { decodedJwt, generateAccessToken, verifyRefreshToken } from '@utils/auth/jwt.util';
import HttpStatusCodes from '@utils/api/httpStatusCode.util';
import User, { UserDocument } from 'src/models/user.model';
import generateHashFromString from '@utils/generators/generateHashFromString.util';
import appSettings from '@config/settings.config';

class AuthService {
  async createUserAndSendWelcomeEmail(
    emailUrl: string,
    email: string,
    password: string,
    passwordConfirm: string,
    confirmationUrl: string,
    next: NextFunction,
  ) {
    const newUser = await User.create({ email, password, passwordConfirm });

    if (!newUser) next(new AppError('Something went wrong', HttpStatusCodes.FORBIDDEN));

    await new Email(newUser, emailUrl)
      .sendWelcome()
      .catch((err) =>
        next(
          new AppError(
            `Something went wrong while sending Email \n ${err.message}`,
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
          ),
        ),
      );

    await this.sendVerificationEmail(newUser.email, confirmationUrl, next);

    return newUser;
  }

  async login(email: string, password: string, next: NextFunction) {
    const user = await User.findOne({ email }).select('+password');
    const isPasswordValid = await (user as UserDocument).comparePasswords(password, (user as UserDocument).password);
    if (!user || !isPasswordValid)
      return next(new AppError('Incorrect Email or Password', HttpStatusCodes.BAD_REQUEST));

    return user;
  }

  async refreshAccessToken(refreshToken: string, next: NextFunction) {
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) return next(new AppError('Invalid refresh token', HttpStatusCodes.FORBIDDEN));
    const user = await User.findOne({
      id: (decoded as decodedJwt).id,
    });

    if (!user) return next(new AppError('User not found', HttpStatusCodes.UNAUTHORIZED));

    const accessToken = generateAccessToken(user as UserDocument);
    return accessToken;
  }

  async forgotPassword(email: string, next: NextFunction) {
    const user = await User.findOne({ email });
    if (!user) return next(new AppError(`No User exits with email address ${email} 💀`, HttpStatusCodes.NOT_FOUND));

    // Generate the random reset token
    const passwordResetOTP = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: true });

    try {
      return await new Email(user, 'Your password reset token (valid for 10 min)').composeEmail(
        'PasswordReset',
        'Your password reset OTP (valid for 10 min)',
        {
          otp: `${passwordResetOTP}`,
        },
      );
    } catch (err) {
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpiresIn = undefined;
      await user.save({ validateBeforeSave: true });

      return next(
        new AppError(
          '😞😥There was an error sending the Email. Try again later!',
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }

  async resetPassword(otp: string, newPassword: string, next: NextFunction) {
    const hashedOTP = generateHashFromString(otp);

    const user = await User.findOne({
      passwordResetTokenExpiresIn: { $gt: Date.now() },
      passwordResetToken: hashedOTP,
    });

    if (!user) return next(new AppError('Token has Expired, Log In Again', HttpStatusCodes.BAD_REQUEST));

    user.passwordChangedAt = Date.now();
    user.password = newPassword;
    await user.save();

    return user;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    passwordConfirm: string,
    currentUser: UserDocument,
    next: NextFunction,
  ) {
    const userId = currentUser.id;
    const user = (await User.findById(userId).select('+password')) as UserDocument;

    if (!user) return next(new AppError('User not found', HttpStatusCodes.NOT_FOUND));

    if (await user.comparePasswords(currentPassword, user.password))
      return next(new AppError('Password is Wrong', HttpStatusCodes.UNAUTHORIZED));

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    user.save();
    return user;
  }

  async sendVerificationEmail(email: string, confirmationUrl: string, next: NextFunction) {
    const user = await User.findOne({ email });
    if (!user) return next(new AppError(`No User exits with email address ${email} 💀`, HttpStatusCodes.NOT_FOUND));

    const verifyEmailToken = user.generateVerifyEmailToken();
    await user.save({ validateBeforeSave: true });
    try {
      return await new Email(user, `${confirmationUrl}${verifyEmailToken}`).composeEmail(
        'verifyEmail',
        `${appSettings.appName} Email verification`,
        { verificationLink: `${confirmationUrl}${verifyEmailToken}` },
      );
    } catch (err) {
      user.verifyEmailToken = undefined;
      user.verifyEmailTokenExpiresIn = undefined;
      await user.save({ validateBeforeSave: true });

      return next(
        new AppError(
          '😞😥There was an error sending the Email. Try again later!',
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }

  async verifyEmail(token: string, next: NextFunction) {
    const user = await User.findOne({
      verifyEmailTokenExpiresIn: { gt: new Date() },
      verifyEmailToken: token,
    });

    if (!user) return next(new AppError('Token has Expired', HttpStatusCodes.BAD_REQUEST));

    user.isEmailVerified = true;

    await user.save();

    return user;
  }
}

export default AuthService;
