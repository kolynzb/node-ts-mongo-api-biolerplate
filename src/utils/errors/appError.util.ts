import HttpStatusCodes from '@utils/api/httpStatusCode.util';

export interface appError extends Error {
  statusCode: number;

  status: string;

  IsOperational: boolean;

  code?: number;
}

/**
 * Custom error class representing an application error.
 */
class AppError extends Error implements appError {
  /**
   * The HTTP status code associated with the error.
   */
  statusCode: number;

  /**
   * The status of the error (e.g., 'fail' or 'error').
   */
  status: string;

  /**
   * Flag indicating if the error is operational.
   */
  IsOperational: boolean;

  /**
   * Creates a new instance of the AppError class.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   */
  constructor(message: string, statusCode: HttpStatusCodes) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.IsOperational = true;

    Error.captureStackTrace(this, this.constructor); // prevent pollution of the stack trace
  }
}

export default AppError;
