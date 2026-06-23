import { inject, signal } from "@angular/core";
import { Supa } from "../services/supa";

export class imagen
{
  private supaService = inject(Supa);

  public imagen = signal<File | null>(null);
  public urlFoto = signal<string | null>(null);
  private lasPath = signal<string | null>(null);
  public reviewUrl? : string; //para vista previa

  mostrarImagen(event: Event)
  {
    const file = (event.target as HTMLInputElement).files?.[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    this.imagen.set(file);
    this.reviewUrl = url;
  }

  async upload(url : string | null)
  {
    const file = this.imagen();
    let path = "";
    let publicUrl = "";
    if(file)
    {
        if(url)
        {
            path = url + file.name;
        }
        else
        {
          path = file.name;
        }
        const data = await this.supaService.uploadImage(path, file);
        console.log(data);
        publicUrl = await this.supaService.getPublicUrl(path);
        this.lasPath.set(path);
        this.urlFoto.set(publicUrl);
    }
    else
    {
        this.urlFoto.set(publicUrl);
    }
  }

  async delete()
  {
    const lasPath = this.lasPath();
    if(!lasPath) return;
    const { data, error } = await this.supaService.removeImage(lasPath);
    if(error)
    {
      console.error(error);
    }
    console.log('archivo eliminado exitosamente!', data);
    this.urlFoto.set(null);
    this.lasPath.set(null);
  }
}