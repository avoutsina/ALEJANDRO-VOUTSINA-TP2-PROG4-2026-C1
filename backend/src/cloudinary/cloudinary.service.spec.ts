import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as streamifier from 'streamifier';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

jest.mock('streamifier', () => ({
  createReadStream: jest.fn(),
}));

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    const configService = {
      get: jest.fn(
        (key: string) =>
          ({
            CLOUDINARY_CLOUD_NAME: 'demo',
            CLOUDINARY_API_KEY: '123',
            CLOUDINARY_API_SECRET: 'secret',
          })[key],
      ),
    } as unknown as ConfigService;

    service = new CloudinaryService(configService);
  });

  it('debe subir un archivo aunque venga desde una ruta temporal sin buffer', async () => {
    const pipe = jest.fn();
    (streamifier.createReadStream as jest.Mock).mockImplementation(
      (buffer: Buffer | undefined) => {
        if (!buffer) {
          throw new Error('buffer required');
        }
        return { pipe };
      },
    );
    (fs.createReadStream as jest.Mock).mockReturnValue({ pipe });
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (options: unknown, callback: Function) => {
        callback(null, {
          public_id: 'avatar-123',
          secure_url:
            'https://res.cloudinary.com/demo/image/upload/avatar-123.jpg',
          format: 'jpg',
        });
        return {};
      },
    );

    await expect(
      service.uploadImage({ path: 'tmp/avatar.jpg' } as Express.Multer.File),
    ).resolves.toEqual({
      public_id: 'avatar-123',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/avatar-123.jpg',
      format: 'jpg',
    });
  });
});
