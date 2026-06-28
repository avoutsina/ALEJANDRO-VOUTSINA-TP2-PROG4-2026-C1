import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

/**
 * Interceptor que captura errores 401 y redirige al login.
 * Esto cubre el requisito: "Si una petición devuelve un error 401, redirigir al login".
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(Auth);

  // No interceptar las rutas de login, register, autorizar y refrescar
  const rutasPublicas = ['/login', '/register', '/autorizar', '/refrescar'];
  const esRutaPublica = rutasPublicas.some(ruta => req.url.includes(ruta));

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !esRutaPublica) {
        // Token inválido o vencido → limpiar sesión y redirigir al login
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
