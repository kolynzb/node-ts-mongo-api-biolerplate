import crypto from 'crypto';

const generateRandHash = (): string => {
  const randString = crypto.randomBytes(32).toString('hex');
  return crypto.createHash('sha256').update(randString).digest().toString('hex');
};

export default generateRandHash;
