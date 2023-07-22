/**
 * Decorator that handles errors for async functions.
 * It catches any errors thrown by the decorated function,
 * logs the error to the console, and rethrows the error.
 *
 * @example Usage:
 * ```
 * class ExampleClass {
 *   @errorHandler
 *   async exampleMethod() {
 *     // Your implementation here
 *   }
 * }
 * ```
 */
function errorHandler(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } catch (error) {
      console.error(`Error in ${propertyKey}:`, error);
      throw error;
    }
  };

  return descriptor;
}

export default errorHandler;
