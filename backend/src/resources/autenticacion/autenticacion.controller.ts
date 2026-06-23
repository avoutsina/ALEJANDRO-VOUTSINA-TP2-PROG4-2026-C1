import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { SupabaseService } from './supabase.service';
import { CredencialesDto } from './dto/credencialesDto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { AuthGuard } from '../../guards/auth.guard';

@Controller()
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('login')
  login(@Body() body: CredencialesDto) {
    return this.autenticacionService.login(body);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Body() body: CreateUsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const avatarUrl = await this.supabaseService.uploadImage(file);
      if (avatarUrl) {
        body.avatar = avatarUrl;
      }
    }
    return this.autenticacionService.register(body);
  }

  @UseGuards(AuthGuard)
  @Get('data')
  traer(@Headers('Authorization') autHeader: string) {
    return this.autenticacionService.verificar(autHeader);
  }
}
