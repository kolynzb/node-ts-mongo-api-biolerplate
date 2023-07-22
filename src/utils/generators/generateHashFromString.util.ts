import crypto from 'crypto';

/**
 * Generate hash for a string
 * @param {[string]} str to Hash.
 * @example
 * // Generate a hash for a string
 * const hash = generate("hash string");
 *
 */
const generateHashFromString = (str: string) => crypto.createHash('sha256').update(str).digest().toString();

export default generateHashFromString;
