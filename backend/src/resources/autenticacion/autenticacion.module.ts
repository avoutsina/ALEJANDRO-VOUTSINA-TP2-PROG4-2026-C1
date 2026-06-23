import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [UsuariosModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, SupabaseService],
})
export class AutenticacionModule
{}
