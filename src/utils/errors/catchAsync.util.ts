/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

/**
 * Wraps an asynchronous route handler function with error handling middleware.
 *
 * @param {Function} fn - The asynchronous route handler function.
 * @returns {Function} A middleware function that can be used with Express routes.
 *
 * @example
 * ```
 * app.get('/example', catchAsync(async (req, res, next) => {
 *   // Your asynchronous code here
 * }));
 * ```
 */
const catchAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

export default catchAsync;
