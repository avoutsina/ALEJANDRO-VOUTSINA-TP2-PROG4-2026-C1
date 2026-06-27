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
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CredencialesDto } from './dto/credencialesDto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { AuthGuard } from '../../guards/auth.guard';

@Controller()
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('login')
  login(@Body() body: CredencialesDto) {
    return this.autenticacionService.login(body);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async register(
    @Body() body: CreateUsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      if (uploadResult?.secure_url) {
        body.avatar = uploadResult.secure_url;
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

