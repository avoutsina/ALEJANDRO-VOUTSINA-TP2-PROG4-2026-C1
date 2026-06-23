import { Component, inject} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { imagen } from '../../../Classes/imagen';
import { NgStyle } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgStyle],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro
{
  formularioRegistro = new FormGroup
  (
    {
      correo : new FormControl("",
        [
          Validators.required,
          Validators.email,
          Validators.minLength(8),
          Validators.maxLength(100)
        ]),
      contrasenia : new FormControl("",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d\\s!@#$%^&*()_\\-+=¿?¡!.,;:<>~"\'`´/\\\\|\\[\\]{}]+$')
        ]),
      repetirContrasenia : new FormControl("",
        [
          Validators.required,
          this.validarContrasenia
        ]),
      nombre : new FormControl("",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      apellido : new FormControl("",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      nombreUsuario : new FormControl("",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z0-9]+$')
        ]),
      fechaNacimiento : new FormControl("",
        [
          Validators.required,
        ]),
      descripcion : new FormControl(""),
      admin : new FormControl(false)
    }
  );
  
  validarContrasenia(control: AbstractControl) : ValidationErrors | null
  {
    // si no hay control.parent aún (por inicialización) o está vacío, no marcar error aquí
    if(!control || !control.parent)
    {
      return null;
    }

    const contrasenia = control.parent.get('contrasenia')?.value;
    // si aún no ingresaron la contraseña principal, no marcamos el error aquí
    if(!control.value || !contrasenia) return null;

    // si coinciden -> ok (null). si no -> error con clave booleana true.
    return control.value === contrasenia ? null : { iguales: true }
  }

  get getCorreo()
  {
    return this.formularioRegistro.controls.correo;
  }
  get getContrasenia()
  {
    return this.formularioRegistro.controls.contrasenia;
  }
  get getRepetirContrasenia()
  {
    return this.formularioRegistro.controls.repetirContrasenia;
  }
  get getNombre()
  {
    return this.formularioRegistro.controls.nombre;
  }
  get getApellido()
  {
    return this.formularioRegistro.controls.apellido;
  }
  get getNombreUsuario()
  {
    return this.formularioRegistro.controls.nombreUsuario;
  }
  get getFechaNacimmiento()
  {
    return this.formularioRegistro.controls.fechaNacimiento;
  }
  get getDescripcion()
  {
    return this.formularioRegistro.controls.descripcion;
  }
  get getAdmin()
  {
    return this.formularioRegistro.controls.admin;
  }

  imagenClass : imagen = new imagen();
  authService = inject(Auth);

  async register()
  {
    const fechaNacimientoString = this.formularioRegistro.controls.fechaNacimiento.value as string;
    const fechaDeNacimiento = new Date(fechaNacimientoString);

    const avatarFile = this.imagenClass.imagen();
    if (!avatarFile)
    {
      Swal.fire({
        title: "Imagen requerida",
        text: "Debe seleccionar una foto de perfil.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        draggable: true
      });
      return;
    }

    const correo = this.formularioRegistro.value.correo as string;
    const contrasenia = this.formularioRegistro.value.repetirContrasenia as string;
    const nombre = this.formularioRegistro.value.nombre as string;
    const apellido = this.formularioRegistro.value.apellido as string;
    const nombreUsuario = this.formularioRegistro.value.nombreUsuario as string;
    const descripcion = this.formularioRegistro.value.descripcion as string;
    const admin = this.formularioRegistro.value.admin as boolean;

    this.authService.register
    (
      {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        nombreUsuario: nombreUsuario,
        contrasenia: contrasenia, 
        descripcion: descripcion,
        fechaDeNacimiento: fechaDeNacimiento,
        admin: admin,
        baneado: false
      }, avatarFile, this.authService.getPermiso
    );
  }
}
