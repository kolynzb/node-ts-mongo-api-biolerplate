import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import otpGeneratorUtil from '@utils/generators/otpGenerator.util';
import generateHashFromString from '@utils/generators/generateHashFromString.util';
import config from '@config/convict.config';
import generateRandHash from '@utils/generators/generateRandHash.util';

export interface UserDocument extends mongoose.Document {
  avatar: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  googleId: string;
  password: string;
  passwordConfirm: string | undefined;
  role: string;
  passwordChangedAt: Date | number;
  passwordResetOTP: string | undefined;
  passwordResetOTPExpiresIn: Date | undefined;
  active: boolean;
  isEmailVerified: boolean;
  verifyEmailToken: string | undefined;
  verifyEmailTokenExpiresIn: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  wasPasswordChanged(jwtTimestamp: number): boolean;
  comparePasswords(candidatePassword: string, userPassword: string): Promise<boolean>;
  generatePasswordResetOTP(): string;
  comparePasswordResetOTPs(candidatePasswordResetOTP: string, userPasswordResetOTP: string): Promise<boolean>;
  generateVerifyEmailToken(): string;
  comparePasswordResetOTPs(candidateToken: string, userVerifyEmailToken: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: String, // see if there is a type for a url
    },
    googleId: {
      type: String,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, 'Email Field Required'],
      unique: true,
      match: [/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 'Invalid Email Address'],
    },
    phoneNumber: {
      type: String,
      // required: [true, 'Phone Number Field Required'],
      unique: true,
      validate: [validator.isMobilePhone, 'Please Provide a Valid Phone Number'],
    },
    password: {
      type: String,
      minlength: [8, 'Password should contain at least 8 characters'],
      select: false,
      validate: {
        validator: function (el: string): boolean {
          return validator.isStrongPassword(el, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          'Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 symbol and must contain at least 8 characters',
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // Only works on CREATE and SAVE!!!
        validator(el: string): boolean {
          const user = this as UserDocument;
          return el === user.password;
        },
        message: 'PasswordConfirm  Should match Password field!',
      },
    },
    passwordChangedAt: Date,
    passwordResetOTP: String,
    passwordResetOTPExpiresIn: Date,
    verifyEmailToken: String,
    verifyEmailTokenExpiresIn: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'USER',
      enum: {
        values: ['USER', 'ADMIN', 'AUTHOR'],
        message: "Role must be either 'USER' or 'ADMIN' or 'AUTHOR'",
      },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  const user = this as UserDocument;

  if (!user.isModified('password')) return next();
  const SALT_WORK_FACTOR = await bcrypt.genSalt(config.get('saltWorkFactor'));
  user.password = await bcrypt.hash(user.password, SALT_WORK_FACTOR);
  user.passwordConfirm = undefined;
  return next();
});

/**
 * Query middleware that removes deactivated users t
 * this points to the current query
 */
userSchema.pre(/^find/, async function (next) {
  await this.find({ active: { $ne: false } });
  next();
});

/**
 *  Instance method to check password correctness
 * this.password is not available because of the select false
 *
 */
userSchema.methods.comparePasswords = async function (candidatePassword: string, userPassword: string) {
  return bcrypt.compare(candidatePassword, userPassword);
};

/** setting password changed at or new user */
userSchema.pre('save', function (next) {
  const user = this as UserDocument;
  if (!user.isModified('password') || user.isNew) return next();

  user.passwordChangedAt = Date.now() - 1000;
  return next();
});

/**
 * Check if password changed after token issued
 */
userSchema.methods.wasPasswordChanged = function (jwtTimestamp: number) {
  if (!this.passwordChangedAt) return false;

  const changedAT = parseInt(`${this.passwordChangedAt.getTime() / 1000}`, 10);

  return jwtTimestamp < changedAT;
};

userSchema.methods.generatePasswordResetOTP = function (): string {
  const resetOTP = otpGeneratorUtil.generate(16, {
    upperCaseAlphabets: true,
    specialChars: false,
  });
  this.passwordResetOTP = generateHashFromString(resetOTP);
  this.passwordResetOTPExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes
  return resetOTP;
};

userSchema.methods.comparePasswordResetOTPs = async function (
  candidatePasswordResetOTP: string,
  userPasswordResetOTP: string,
) {
  return generateHashFromString(candidatePasswordResetOTP) === userPasswordResetOTP;
};

userSchema.methods.generateVerifyEmailToken = function (): string {
  const resetToken = generateRandHash();
  this.verifyEmailToken = generateHashFromString(resetToken);
  this.verifyEmailTokenExpiresIn = new Date(Date.now() + 24 * 60 * 60 * 1000); // expires in 24 hrs
  return resetToken;
};

userSchema.methods.compareVerifyEmailTokens = async function (candidateToken: string, userVerifyEmailToken: string) {
  return generateHashFromString(candidateToken) === userVerifyEmailToken;
};

const User = mongoose.model<UserDocument>('User', userSchema);
export default User;
