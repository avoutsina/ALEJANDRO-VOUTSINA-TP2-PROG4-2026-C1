import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const noEstaLogueadoGuard: CanActivateFn = (route, state) =>
{
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado())
  {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};
