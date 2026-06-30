import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  transform(value: string | null | undefined, word: string): string {
    if (!value) return '';
    if (!word) return value;
    const re = new RegExp(`(${word})`, 'gi');
    return value.replace(re, `<mark class="bg-warning text-dark">$1</mark>`);
  }
}
