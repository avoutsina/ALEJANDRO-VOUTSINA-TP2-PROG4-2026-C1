import { signal } from '@angular/core';

export class imagen {
  public imagen = signal<File | null>(null);
  public urlFoto = signal<string | null>(null);
  public reviewUrl?: string; // para vista previa

  mostrarImagen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    this.imagen.set(file);
    this.reviewUrl = url;
  }

  /**
   * Supabase/Supa eliminado.
   * El upload de la imagen debe hacerse desde el backend (Cloudinary) o con el flujo que ya usa Auth.register.
   */
  async upload(_url: string | null) {
    throw new Error(
      'Supabase eliminado: no se usa imagen.upload(). Usa Auth.register con FormData.',
    );
  }

  /**
   * Supabase/Supa eliminado.
   */
  async delete() {
    throw new Error('Supabase eliminado: no se usa imagen.delete().');
  }
}
