import { Injectable} from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class Supa
{
  public supabase: SupabaseClient;

  constructor()
  {
    this.supabase = createClient(environments.url, environments.key);
  }

  async uploadImage(filePath: string, file: File)
  {
    const {data, error} = await this.supabase.storage.from(environments.bucket).upload(filePath, file, { upsert: true });
    if(error)
    {
      console.log(error);
    }
    return data;
  }

  async getPublicUrl(filePath: string)
  {
    const { data } = await this.supabase.storage.from(environments.bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async removeImage(path: string)
  {
    return await this.supabase.storage.from(environments.bucket).remove([path]);
  }
}
