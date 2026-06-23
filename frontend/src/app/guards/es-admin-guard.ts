import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const esAdminGuard: CanActivateFn = (route, state) =>
{
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.getPermiso)
  {
    router.navigateByUrl('/inicio');
    return false;
  }
  return true;
};
