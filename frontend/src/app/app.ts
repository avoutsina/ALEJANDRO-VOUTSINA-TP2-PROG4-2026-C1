import { Component, inject} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App
{
  authService = inject(Auth);
  
  ngOnInit()
  {
    this.authService.estado();
  }

  cerrarSesion()
  {
    this.authService.logout();
  }

  get getPermiso()
  {
    return this.authService.getPermiso;
  }
}
