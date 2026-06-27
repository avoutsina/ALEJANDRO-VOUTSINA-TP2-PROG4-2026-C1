import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
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

  async uploadImage(file: Express.Multer.File): Promise<{ public_id: string; secure_url: string; format: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile_images',
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

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

