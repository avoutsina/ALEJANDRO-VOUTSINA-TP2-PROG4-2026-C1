import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleFriendly',
  standalone: true
})
export class RoleFriendlyPipe implements PipeTransform {
  transform(isAdmin: boolean | undefined): string {
    return isAdmin ? 'Administrador' : 'Usuario';
  }
}
