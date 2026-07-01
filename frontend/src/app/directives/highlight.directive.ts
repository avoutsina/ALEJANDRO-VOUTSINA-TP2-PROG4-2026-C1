import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlightColor: string = 'rgba(255, 255, 255, 0.1)';

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
  }

  @HostListener('mouseenter') onMouseEnter() {
    // Como los td tienen color fijo en el CSS, cambiamos el color directamente a los td hijos
    const tds = this.el.nativeElement.querySelectorAll('td');
    tds.forEach((td: HTMLElement) => {
      this.renderer.setStyle(td, 'background-color', 'rgb(24, 60, 72)');
    });
  }

  @HostListener('mouseleave') onMouseLeave() {
    const tds = this.el.nativeElement.querySelectorAll('td');
    tds.forEach((td: HTMLElement) => {
      this.renderer.setStyle(td, 'background-color', 'rgb(14, 39, 48)');
    });
  }
}
