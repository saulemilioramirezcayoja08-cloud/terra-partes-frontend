import {Component, HostListener, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-order-create',
  imports: [],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css'
})
export class OrderCreate {
  private router = inject(Router);

  // Verifica si el elemento activo es un campo de texto o editable
  private isTextLikeTarget(el: EventTarget | null): boolean {
    const t = el as HTMLElement | null;
    if (!t) return false;
    const tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    if ((t as any).isContentEditable) return true;
    return false;
  }

  // Detecta atajos de teclado globales
  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent) {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
    const isPrintShortcut = ctrlOrCmd && (e.key === 'p' || e.key === 'P');

    // Abre el componente OrderSelectProduct con Ctrl/Cmd + P
    if (isPrintShortcut) {
      e.preventDefault();
      this.router.navigate(['/order/select-product'], {
        queryParams: {v: Date.now()}, // Fuerza recarga del componente
        state: {from: 'order-create'}
      });
      return;
    }

    // Ignora eventos si el foco está en un campo de texto
    if (this.isTextLikeTarget(e.target)) return;
  }
}
