import { BadRequestException, CanActivate, ExecutionContext, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { type Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor(private readonly jwtService: JwtService){}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
  {
    const request : Request = context.switchToHttp().getRequest();
    const authHeader : string | undefined = request.headers.authorization;
    if(!authHeader)
    {
      throw new BadRequestException("Necesitas estar logueado");
    }

    const [tipo, token] = authHeader.split(' ');
    if(tipo !== "Bearer")
    {
      throw new BadRequestException("Necesitas estar logueado");
    }

    try
    {
      const tokenValidado = this.jwtService.verify(token);
      (request as any).user = tokenValidado;
      return true;
    }
    catch(error: any)
    {
      if(error.name === 'TokenExpiredError')
      {
        throw new HttpException('Token expirado', 401);
      }

      if(error.name === 'JsonWebTokenError')
      {
        throw new HttpException('Firma falló o tóken modificado', 401);
      }

      throw new InternalServerErrorException();
    }
  }
}
