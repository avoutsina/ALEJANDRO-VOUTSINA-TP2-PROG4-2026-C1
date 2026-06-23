import { BadRequestException, CanActivate, ExecutionContext, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Request } from 'express';
import { JsonWebTokenError, JwtPayload, TokenExpiredError, verify} from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor( private readonly configService : ConfigService){}

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
      const secret = this.configService.get<string>("JWT_SECRET")
      if(!secret)
      {
          return false
      }
      const tokenValidado : JwtPayload | string = verify(token, secret);
      (request as any).user = tokenValidado;
      return true;
    }
    catch(error)
    {
      if(error instanceof TokenExpiredError)
      {
        throw new HttpException('Token expirado', 401);
      }

      if(error instanceof JsonWebTokenError)
      {
        throw new HttpException('Firma falló o tóken modificado', 401);
      }

      throw new InternalServerErrorException();
    }
  }
}
