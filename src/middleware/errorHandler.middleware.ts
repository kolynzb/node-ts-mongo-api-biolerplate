import { z } from 'zod';
import dotenv from 'dotenv-safe';
import { NextFunction, Request, Response } from 'express';
import AppError, { appError } from '@utils/errors/appError.util';
import log from '@config/logger.config';
import HttpStatusCodes from '@utils/api/httpStatusCode.util';

dotenv.config();

const { NODE_ENV } = process.env;

// handle invalid db ids
const handleCastErrorDB = (err: any) => new AppError(`Invalid ${err.path} : ${err.value}`, HttpStatusCodes.BAD_REQUEST);

const handleDuplicateErrorDB = (err: any) => {
  // regex to find the value in quotes
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  return new AppError(`Duplicate field value of ${value}`, HttpStatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  // handling invalid input data
  return new AppError(`invalid input data. ${errors.join('. ')}`, HttpStatusCodes.BAD_REQUEST);
};
const handleJWTError = () => new AppError('Invalid token please login again', HttpStatusCodes.BAD_REQUEST);

const handleJWTExpiredError = () => new AppError('Token has expired please login again', HttpStatusCodes.BAD_REQUEST);

const handleZodValidationError = (error: any) => {
  if (error instanceof z.ZodError) {
    const messages: any = [];

    error.errors.forEach((err: any) => {
      const field = err.path.join('.');
      const message = err.message.replace(`"${field}"`, field);
      messages.push(message);
    });

    const joinedMessages = messages.join('. ');

    return new AppError(`Invalid data ${joinedMessages}`, HttpStatusCodes.BAD_REQUEST);
  }

  return error;
};

const sendErrDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrProd = (err: appError, res: Response) => {
  if (err.IsOperational) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming errors should not leak details
    log.error('Error 💥💥', err);

    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

export default (err: appError, req: Request, res: Response, next: NextFunction): void => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;

  if (NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    error = handleZodValidationError(error);

    sendErrProd(error, res);
  } else if (NODE_ENV === 'development') {
    sendErrDev(err, res);
  }
};
