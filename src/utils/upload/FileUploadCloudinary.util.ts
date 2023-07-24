import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express';
import { Readable } from 'stream';

class CloudinaryUploader {
  private folder: string;

  constructor(folder: string) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.folder = folder;
  }

  private bufferUpload(buffer: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const writeStream = cloudinary.uploader.upload_stream({ folder: this.folder }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
      const readStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });
      readStream.pipe(writeStream);
    });
  }

  public async uploadFromBuffer(buffer: any): Promise<UploadApiResponse> {
    try {
      const bufferObj = await this.bufferUpload(buffer);
      return bufferObj as UploadApiResponse;
    } catch (error) {
      throw new Error('Image upload failed');
    }
  }

  public async uploadFromFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    try {
      const { buffer } = file;
      const bufferObj = await this.bufferUpload(buffer);
      return bufferObj as UploadApiResponse;
    } catch (error) {
      throw new Error('Image upload failed');
    }
  }
}

export default CloudinaryUploader;
