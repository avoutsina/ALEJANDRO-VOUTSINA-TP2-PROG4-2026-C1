import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AutenticacionService } from '../autenticacion.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private autenticacionService: AutenticacionService) {
    super({ usernameField: 'correo', passwordField: 'contrasenia' });
  }

  async validate(correo: string, contrasenia: string): Promise<any> {
    // Validar por login clásico
    const result = await this.autenticacionService.validateUser(correo, contrasenia);
    if (!result) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return result;
  }
}
