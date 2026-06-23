import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private url: string;
  private key: string;
  private bucket: string;

  constructor() {
    this.url =
      process.env.SUPABASE_URL || 'https://agyvrqfvvwacjvgvmaxg.supabase.co';
    this.key =
      process.env.SUPABASE_KEY ||
      'sb_publishable_uN7KhBrylb2VB1BVCkGWGA_yoKwE_Es';
    this.bucket = process.env.SUPABASE_BUCKET || 'imagenes';
    this.supabase = createClient(this.url, this.key);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'perfil/',
  ): Promise<string | null> {
    const fileName = `${folder}${Date.now()}_${file.originalname}`;
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return null;
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl ?? null;
    } catch (err) {
      console.error('Supabase upload exception:', err);
      return null;
    }
  }
}
