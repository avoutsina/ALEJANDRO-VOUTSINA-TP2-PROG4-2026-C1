import { CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';
import { type Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate
{
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
  {
    const request : Request = context.switchToHttp().getRequest();
    const user = (request as any).user;
    if(user?.admin)
    {
      return true;
    }
    throw new ForbiddenException("Necesitas permiso de administrador para acceder");
  }
}
