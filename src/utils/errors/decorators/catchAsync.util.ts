/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction } from 'express';

/**
 * Decorator function for handling asynchronous errors in Express route handlers.
 *
 * @returns {Function} A decorator function that can be applied to an Express route handler method.
 *
 * @example
 * ```
 * class ExampleController {
 *   @catchAsync()
 *   async exampleHandler(req, res, next) {
 *     // Your implementation here
 *   }
 * }
 * ```
 */
const catchAsync =
  () =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    // Store the reference to the original method being decorated
    const originalMethod = descriptor.value;

    // Replace the original method with an async function that handles errors
    descriptor.value = async function (...args: any[]) {
      // Extract the 'next' function from the arguments array
      const next = args[args.length - 1] as NextFunction;

      try {
        // Invoke the original method and wait for it to complete
        await originalMethod.apply(this, args);
      } catch (error) {
        // If an error occurs, call the 'next' function with the error
        next(error);
      }
    };

    return descriptor;
  };

export default catchAsync;
