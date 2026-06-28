import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

/**
 * Pantalla de carga inicial.
 * - Muestra un spinner mientras valida el token con POST /autorizar.
 * - Si el token es válido → redirige a /inicio.
 * - Si el token es inválido/vencido o no existe → redirige a /login.
 */
@Component({
  selector: 'app-cargando',
  standalone: true,
  imports: [],
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class CargandoPage implements OnInit
{
  private authService = inject(Auth);
  private router = inject(Router);

  ngOnInit(): void
  {
    const token = localStorage.getItem('Token');

    if (!token)
    {
      // Sin token → ir directo al login
      this.router.navigateByUrl('/login');
      return;
    }

    // Validar el token contra el backend con /autorizar
    this.authService.autorizar().subscribe({
      next: () =>
      {
        // Token válido → ir a inicio
        this.authService.estado.set(true);
        this.router.navigateByUrl('/inicio');
      },
      error: () =>
      {
        // Token inválido o vencido → limpiar y redirigir al login
        localStorage.removeItem('Token');
        this.authService.estado.set(false);
        this.router.navigateByUrl('/login');
      }
    });
  }
}
