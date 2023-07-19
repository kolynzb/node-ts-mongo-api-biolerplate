import mongoose from 'mongoose';
import log from './logger.config';

const connectDB = async (DB_URI: string): Promise<void> => {
  log.info('.......Connecting to Mongo DB.......');
  await mongoose
    .connect(DB_URI)
    .then(() => log.info('🍾.....Database Connected successfully....🍾'))
    .catch((err: any) => log.error('Error connecting to Database ', err));
};

export default connectDB;
