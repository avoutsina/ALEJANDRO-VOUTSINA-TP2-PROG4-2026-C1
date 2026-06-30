import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAvatarFallback]',
  standalone: true
})
export class AvatarFallbackDirective {
  @Input('appAvatarFallback') fallbackUrl: string = '/assets/User.svg';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('error') onError() {
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.fallbackUrl);
  }
}
