import { Readable } from 'stream';

/**
 * Converts a stream to a buffer.
 * @param stream - The stream to convert.
 * @returns A Promise that resolves to the buffer.
 * @example
 *```ts
 *const myStream = ... // Your stream object
 *
 *stream2Buffer(myStream)
 *  .then((buffer: Buffer) => {
 *    console.log(buffer);
 *  })
 *  .catch((error: Error) => {
 *    console.error('Error converting stream to buffer:', error);
 *  });
 * ```
 */
export default function stream2Buffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    stream.on('error', (error: Error) => {
      reject(error);
    });
  });
}
