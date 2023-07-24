import multer, { FileFilterCallback } from 'multer';
import { Express, Request } from 'express';
import sharp from 'sharp';
import AppError from '@utils/errors/appError.util';

const allowedAttachmentMimetypes = ['application/pdf', 'audio/mp3', 'audio/wav', 'image/jpeg', 'image/png'];

const isAllowedMimetype = (file: Express.Multer.File, allowedMimetypes: string[]): boolean =>
  allowedMimetypes.includes(file.mimetype);

const processImage = async (file: Express.Multer.File, cb: FileFilterCallback) => {
  try {
    const processedImage = await sharp(file.buffer).webp().toBuffer();

    file.buffer = processedImage;
    file.originalname = file.originalname.replace(/\.[^.]+$/, '.webp');
    file.mimetype = 'image/webp';

    cb(null, true);
  } catch (error) {
    cb(new AppError('Error processing image', 500));
  }
};

/**
 * Configures Multer for handling file uploads of attachments with restricted mimetypes.
 * Accepts files of types such as PDFs, audio files, and images.
 *
 * @returns {multer.Instance} The Multer middleware instance.
 * @example
 * ```
 * router.post('/images', uploadAttachment.single('file'), (req, res) => {
 * // Access the uploaded image using req.file
 * // Handle the image upload logic
 *});
 * ```
 */
export const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isAllowedType = isAllowedMimetype(file, allowedAttachmentMimetypes);

    if (isAllowedType) {
      if (file.mimetype.startsWith('image')) processImage(file, cb);

      cb(null, true); // Accept the file
    } else {
      cb(new AppError('Invalid file type for attachments', 400)); // Reject the file
    }
  },
});

/**
 * Configures Multer for handling file uploads of images only with restricted mimetypes.
 * Accepts files of image types such as JPEG and PNG.
 *
 * @returns {multer.Instance} The Multer middleware instance.
 * @example
 * ```
 * router.post('/images', uploadImage.single('image'), (req, res) => {
 * // Access the uploaded image using req.file
 * // Handle the image upload logic
 *});
 * ```
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image')) {
      processImage(file, cb);
    } else {
      cb(new AppError('Invalid file type for images', 400));
    }
  },
});
