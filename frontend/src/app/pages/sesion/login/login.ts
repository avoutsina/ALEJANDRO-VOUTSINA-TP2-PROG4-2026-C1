import { Component, inject} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { Loading } from '../../components/loading/loading';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, Loading],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login
{
  router = inject(Router);
  formularioLogin = new FormGroup
  (
    {
      correo: new FormControl("", [Validators.required]),
      contrasenia: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d\\s!@#$%^&*()_\\-+=¿?¡!.,;:<>~"\'`´/\\\\|\\[\\]{}]+$')
      ])
    }
  )

  get getCorreo()
  {
    return this.formularioLogin.controls.correo;
  }
  get getContrasenia()
  {
    return this.formularioLogin.controls.contrasenia;
  }

  authService = inject(Auth);

  login()
  {
    const correo = this.formularioLogin.value.correo as string;
    const contrasenia = this.formularioLogin.value.contrasenia as string;
    this.authService.login({correo: correo, contrasenia: contrasenia});
  }

  /*
  autoCompletar(correo: string, contrasenia: string)
  {
    this.formularioLogin.patchValue
    ({
      correo: correo,
      contrasenia: contrasenia
    })
  }
  */
}
