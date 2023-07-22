import crypto from 'crypto';

const digits = '0123456789';
const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
const upperCaseAlphabets = lowerCaseAlphabets.toUpperCase();
const specialChars = '#!&@';

interface GenerateOptions {
  digits?: boolean;
  lowerCaseAlphabets?: boolean;
  upperCaseAlphabets?: boolean;
  specialChars?: boolean;
}

/**
 * Generate OTP of the length
 * @param length length of password.
 * @param options
 * @param options.digits Default: `true` true value includes digits in OTP
 * @param options.lowerCaseAlphabets Default: `true` true value includes lowercase alphabets in OTP
 * @param options.upperCaseAlphabets Default: `true` true value includes uppercase alphabets in OTP
 * @param options.specialChars Default: `true` true value includes specialChars in OTP
 *
 * @example
 * // Generate a OTP with 16 characters that includes uppercase alphabets and special characters
 *const password = generate(16, {
 *  upperCaseAlphabets: true,
 *  specialChars: true,
 *});
 *
 * console.log(password); // Example output: "c%8E#W2QX9*1K@Z"
 *
 * // Obtained from  👉🏿 https://github.com/Maheshkumar-Kakade/otp-generator
 *
 * // types from 😥 https://www.npmjs.com/package/@types/otp-generator
 */
function generate(length: number, options?: GenerateOptions): string {
  length = length || 10;
  const generateOptions: GenerateOptions = options || {};

  generateOptions.digits = Object.prototype.hasOwnProperty.call(generateOptions, 'digits') ? options?.digits : true;
  generateOptions.lowerCaseAlphabets = Object.prototype.hasOwnProperty.call(generateOptions, 'lowerCaseAlphabets')
    ? options?.lowerCaseAlphabets
    : true;
  generateOptions.upperCaseAlphabets = Object.prototype.hasOwnProperty.call(generateOptions, 'upperCaseAlphabets')
    ? options?.upperCaseAlphabets
    : true;
  generateOptions.specialChars = Object.prototype.hasOwnProperty.call(generateOptions, 'specialChars')
    ? options?.specialChars
    : true;

  const allowsChars =
    ((generateOptions.digits || '') && digits) +
    ((generateOptions.lowerCaseAlphabets || '') && lowerCaseAlphabets) +
    ((generateOptions.upperCaseAlphabets || '') && upperCaseAlphabets) +
    ((generateOptions.specialChars || '') && specialChars);
  let password = '';
  while (password.length < length) {
    const charIndex = crypto.randomInt(0, allowsChars.length);
    if (password.length === 0 && generateOptions.digits === true && allowsChars[charIndex] === '0') {
      // skip iteration
    }
    password += allowsChars[charIndex];
  }
  return password;
}

export default { generate };
