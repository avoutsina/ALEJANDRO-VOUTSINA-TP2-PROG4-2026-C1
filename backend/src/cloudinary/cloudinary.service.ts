import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'avatars',
  ): Promise<{ public_id: string; secure_url: string; format: string }> {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (result) {
            return resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              format: result.format,
            });
          }
          return reject(new Error('Upload to Cloudinary failed.'));
        },
      );

      if (
        file.buffer &&
        Buffer.isBuffer(file.buffer) &&
        file.buffer.length > 0
      ) {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
        return;
      }

      if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
        return;
      }

      reject(new Error('No file content available for upload.'));
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    if (!publicId) return null;
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async deleteResources(publicIds: string[]): Promise<any> {
    if (!publicIds || publicIds.length === 0) return null;
    return new Promise((resolve, reject) => {
      cloudinary.api.delete_resources(
        publicIds,
        { resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }
}
