import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('appTooltip') tooltipTitle: string = '';
  private tooltipEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltipTitle) return;

    this.tooltipEl = this.renderer.createElement('span');
    this.renderer.appendChild(
      this.tooltipEl,
      this.renderer.createText(this.tooltipTitle)
    );

    this.renderer.appendChild(document.body, this.tooltipEl);

    // Estilos base
    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipEl, 'background-color', 'rgba(0, 0, 0, 0.9)');
    this.renderer.setStyle(this.tooltipEl, 'color', '#fff');
    this.renderer.setStyle(this.tooltipEl, 'padding', '6px 12px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '10000');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipEl, 'box-shadow', '0 4px 10px rgba(0,0,0,0.3)');

    // Cálculo dinámico de posiciones
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipEl!.getBoundingClientRect();

    // Posición por defecto por encima y centrada
    let top = hostPos.top - tooltipPos.height - 10;
    let left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

    // Si se sale por arriba de la pantalla, mostrarlo abajo
    if (top < 10) {
      top = hostPos.bottom + 10;
    }

    // Si se sale por la derecha de la pantalla (ej. última columna de acciones)
    const paddingPantalla = 15;
    const anchoPantalla = window.innerWidth;
    if (left + tooltipPos.width > anchoPantalla - paddingPantalla) {
      left = anchoPantalla - tooltipPos.width - paddingPantalla;
    }

    // Si se sale por la izquierda de la pantalla
    if (left < paddingPantalla) {
      left = paddingPantalla;
    }

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
