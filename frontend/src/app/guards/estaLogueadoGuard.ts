import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const estaLogueadoGuard: CanActivateFn = async (route, state) =>
{
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogueado())
  {
    return true
  }
  if(auth.getPermiso)
  {
    return true;
  }

  router.navigateByUrl('/inicio');
  return false;
};
