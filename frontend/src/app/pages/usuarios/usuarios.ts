import { Component, inject, signal } from '@angular/core';
import { UsuariosService } from '../../services/usuariosService';
import { UsuarioR } from '../../interfaces/usuario';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { RouterLink } from '@angular/router';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';
import Swal from 'sweetalert2';
import { Loading } from '../components/loading/loading';
import { imagen } from '../../Classes/imagen';
import { Auth } from '../../services/auth';
import { RoleFriendlyPipe } from '../../pipes/role-friendly.pipe';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-usuarios',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    Loading,
    RoleFriendlyPipe,
    TooltipDirective,
    HighlightDirective
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios
{
  cargando = signal<boolean>(true);
  mostrarFormularioCrear = signal<boolean>(false);
  imagenClass: imagen = new imagen();

  formularioCrear = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]),
    nombreUsuario: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9]+$')]),
    correo: new FormControl('', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(100)]),
    contrasenia: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(50), Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d\\s!@#$%^&*()_\\-+=¿?¡!.,;:<>~"\'`´/\\\\|\\[\\]{}]+$')]),
    repetirContrasenia: new FormControl('', [Validators.required, (c) => this.validarContrasenia(c)]),
    descripcion: new FormControl(''),
    admin: new FormControl(false, [Validators.required]),
    fechaDeNacimiento: new FormControl('', [Validators.required])
  });

  validarContrasenia(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.parent) return null;
    const contrasenia = control.parent.get('contrasenia')?.value;
    if (!control.value || !contrasenia) return null;
    return control.value === contrasenia ? null : { iguales: true };
  }

  get getNombre() { return this.formularioCrear.controls.nombre; }
  get getApellido() { return this.formularioCrear.controls.apellido; }
  get getNombreUsuario() { return this.formularioCrear.controls.nombreUsuario; }
  get getCorreo() { return this.formularioCrear.controls.correo; }
  get getContrasenia() { return this.formularioCrear.controls.contrasenia; }
  get getRepetirContrasenia() { return this.formularioCrear.controls.repetirContrasenia; }
  get getFechaDeNacimiento() { return this.formularioCrear.controls.fechaDeNacimiento; }
  get getAdmin() { return this.formularioCrear.controls.admin; }

  usuariosService = inject(UsuariosService);
  publicacionesService = inject(PublicacionesUsuario);

  arrayUsuarios = signal<Partial<UsuarioR>[]>([]);
  alternarAdmin = signal<boolean>(false);

  authService = inject(Auth);

  toggleFormulario() {
    this.mostrarFormularioCrear.update(val => !val);
    this.formularioCrear.reset({ admin: false });
    this.imagenClass.imagen.set(null);
    this.imagenClass.urlFoto.set(null);
    this.imagenClass.reviewUrl = undefined;
  }

  submitCrear() {
    if (this.formularioCrear.invalid) return;

    const avatarFile = this.imagenClass.imagen();
    if (!avatarFile) {
      Swal.fire({
        title: "Imagen requerida",
        text: "Debe seleccionar una foto de perfil.",
        icon: "warning",
        confirmButtonText: "Aceptar"
      });
      return;
    }

    const val = this.formularioCrear.value;
    const nuevoUsuario: Partial<UsuarioR> = {
      nombre: val.nombre as string,
      apellido: val.apellido as string,
      correo: val.correo as string,
      nombreUsuario: val.nombreUsuario as string,
      contrasenia: val.repetirContrasenia as string,
      descripcion: val.descripcion as string,
      fechaDeNacimiento: new Date(val.fechaDeNacimiento as string),
      admin: val.admin as boolean,
      baneado: false
    };

    // Usamos el authService.register para que suba avatar a Cloudinary y registre al usuario
    this.authService.register(nuevoUsuario, avatarFile, true);

    // Ocultar formulario, limpiar e invocar refresco
    this.toggleFormulario();
    setTimeout(() => this.traerUsuarios(), 3000);
  }

  ngOnInit()
  {
    this.cargando.set(true);
    this.traerUsuarios();
  }

  traerUsuarios()
  {
    this.usuariosService.traerUsuarios().subscribe(
      {
        next: (res) =>
        {
          console.log(res);
          this.arrayUsuarios.set(res)
        },
        error: (error) =>
        {
          const err = error.error.message;
          Swal.fire
          ({
            title: err,
            icon: "error",
            draggable: true
          });
        },
        complete: () =>
        {
          this.cargando.set(false);
        }
      });
  }

  eliminarUsuario(id?: string)
  {
    Swal.fire
    ({
      title: "¿Estás seguro de deshabilitar?",
      text: "El usuario ya no podrá ingresar a la aplicación",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Deshabilitar",
      cancelButtonText: "Cancelar"
    }).then((result) =>
      {
        if (result.isConfirmed)
        {
          this.usuariosService.eliminarUsuario(id).subscribe(
          {
            next: (res) =>
            {
              // Actualizar localmente el estado del usuario en la lista
              this.arrayUsuarios.update(arr =>
                arr.map(u => u._id === id ? { ...u, baneado: true } : u)
              );
            },
            error: (error) =>
            {
              const err = error.error?.message ?? 'Error';
              Swal.fire
              ({
                title: err,
                icon: "error",
                draggable: true
              });
            },
            complete: () =>
            {
              Swal.fire
              ({
                title: "Deshabilitado",
                text: "Usuario deshabilitado con éxito",
                icon: "success"
              });
            }
          });
        }
    });

  }

  banearUsuario(id?: string, estadoBan?: boolean)
  {
    if(!id) return;
    const valor = !estadoBan;

    const request = valor 
      ? this.usuariosService.eliminarUsuario(id) 
      : this.usuariosService.habilitarUsuario(id);

    request.subscribe({
      next: () => {
        this.arrayUsuarios.update(arr =>
          arr.map(user => user._id === id ? { ...user, baneado: valor } : user)
        );
        Swal.fire({
          title: valor ? "Usuario deshabilitado" : "Usuario habilitado",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        const err = error.error?.message ?? 'Error al actualizar estado';
        Swal.fire({ title: err, icon: "error" });
      }
    });
  }

  cambiarAdmin(_id?: string, esAdmin?: Event)
  {
    const valor = (esAdmin?.target as HTMLInputElement).checked;
    if(!_id) return;
    this.usuariosService.modificarUsuario(_id, {admin: valor}).subscribe(res =>
    {
      console.log(res);
    });
  }
  
}
