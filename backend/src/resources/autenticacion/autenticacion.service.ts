import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CredencialesDto } from './dto/credencialesDto';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuarioService: UsuariosService,
    private readonly configService: ConfigService,
  ) {}

  async login(user: CredencialesDto) {
    let usuario: any = null;
    try {
      usuario = await this.usuarioService.findByEmail(user.correo);
    } catch {
      // Ignorar y probar por nombreUsuario
    }

    if (!usuario) {
      try {
        usuario = await this.usuarioService.findByNombreUsuario(user.correo);
      } catch {
        // Ignorar
      }
    }

    if (!usuario) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (await bcrypt.compare(user.contrasenia, usuario.contrasenia)) {
      if (usuario.baneado) {
        throw new ForbiddenException('El usuario ha sido Baneado');
      } else {
        const tokenRes = this.createToken(
          usuario.correo,
          usuario.admin,
          usuario.nombreUsuario,
          usuario.avatar,
          usuario._id.toString(),
        );
        if (!tokenRes) {
          throw new InternalServerErrorException('No se pudo generar el token');
        }
        const usuarioData: any = usuario.toObject
          ? usuario.toObject()
          : usuario;
        delete usuarioData.contrasenia;
        return {
          Token: tokenRes.Token,
          usuario: usuarioData,
        };
      }
    } else {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  async register(user: CreateUsuarioDto) {
    const usuarioCreado = await this.usuarioService.create(user);
    const tokenRes = this.createToken(
      usuarioCreado.correo,
      usuarioCreado.admin,
      usuarioCreado.nombreUsuario,
      usuarioCreado.avatar,
      usuarioCreado._id.toString(),
    );
    if (!tokenRes) {
      throw new InternalServerErrorException('No se pudo generar el token');
    }
    const usuarioData: any = usuarioCreado.toObject
      ? usuarioCreado.toObject()
      : usuarioCreado;
    delete usuarioData.contrasenia;
    return {
      Token: tokenRes.Token,
      usuario: usuarioData,
    };
  }

  createToken(
    correo: string,
    admin: boolean,
    userName: string,
    avatar: string | null,
    id: string,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      return false;
    }

    const payload: {
      user: string;
      admin: boolean;
      userName: string;
      avatar: string | null;
    } = {
      user: correo,
      admin: admin,
      userName: userName,
      avatar: avatar,
    };

    const token: string = sign(payload, secret, {
      expiresIn: '15m',
      subject: id,
    });

    return { Token: token };
  }

  /**
   * Autorización requerida por el sprint:
   * - Si token inválido/vencido => 401
   * - Si válido => devolver datos del usuario (payload)
   */
  autorizar(auth: string) {
    const tokenValidado = this.verificarToken(auth);
    // El payload incluye: user(admin/userName/avatar) y el subject como id (sub)
    return tokenValidado;
  }

  /**
   * Refresh requerido por el sprint:
   * - Valida token actual y emite nuevo token con misma payload y exp 15m
   */
  refrescar(auth: string) {
    const tokenValidado: any = this.verificarToken(auth);

    const subject = (tokenValidado as any)?.sub;
    const admin = (tokenValidado as any)?.admin;
    const userName = (tokenValidado as any)?.userName;
    const avatar = (tokenValidado as any)?.avatar;
    const correo = (tokenValidado as any)?.user;

    if (!subject || correo === undefined || admin === undefined || !userName) {
      throw new UnauthorizedException('Token inválido');
    }

    const nuevo = this.createToken(
      correo,
      admin,
      userName,
      avatar,
      subject.toString(),
    );
    if (!nuevo)
      throw new InternalServerErrorException('No se pudo refrescar el token');

    return { Token: nuevo.Token };
  }

  /**
   * Verifica token y en caso de error lanza 401.
   */
  private verificarToken(auth: string) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('Falta JWT_SECRET');
    }
    if (!auth) throw new BadRequestException();

    const [tipo, token] = auth.split(' ');
    if (tipo !== 'Bearer') throw new BadRequestException();

    try {
      return verify(token, secret) as any;
    } catch (error: any) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Firma falló o token modificado');
      }
      throw new InternalServerErrorException();
    }
  }

  /**
   * Endpoint legado (puede mantenerse para compatibilidad con /data)
   * Conserva comportamiento original.
   */
  verificar(auth: string) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      return false;
    }
    if (!auth) throw new BadRequestException();

    const [tipo, token] = auth.split(' ');

    if (tipo !== 'Bearer') throw new BadRequestException();

    try {
      const tokenValidado = verify(token, secret);
      return tokenValidado;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return 'Token expirado';
      }
      if (error instanceof JsonWebTokenError) {
        return 'Firma fallo o Token modificado';
      }
      throw new InternalServerErrorException();
    }
  }
}
