import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must be at most 100 characters long')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, {
    message: 'Password must contain at least one letter, one number, and one special character',
  });

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  passwordConfirm: z.string(),
  
});

export const emailSchema = z.string().email();

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RefreshAccessTokenSchema = z.object({
  refreshToken: z.string(),
});

export const confirmEmailSchema = z.object({
  token: z.string(),
});

export const googleAuthSchema = z.object({
  idToken: z.string(),
});
