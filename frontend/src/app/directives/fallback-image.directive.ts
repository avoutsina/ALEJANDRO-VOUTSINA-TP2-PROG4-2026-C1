import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFallbackImage]',
  standalone: true
})
export class FallbackImageDirective {
  @Input() appFallbackImage: string = '/assets/User.svg';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('error') onError() {
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.appFallbackImage);
  }
}
