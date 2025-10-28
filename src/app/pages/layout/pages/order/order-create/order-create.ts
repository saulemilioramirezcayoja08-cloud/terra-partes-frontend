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

    // Ctrl/Cmd + P para seleccionar productos
    const isPrintShortcut = ctrlOrCmd && (e.key === 'p' || e.key === 'P');

    // Ctrl/Cmd + V para vista previa
    const isPreviewShortcut = ctrlOrCmd && (e.key === 'v' || e.key === 'V');

    // Abre el componente OrderSelectProduct con Ctrl/Cmd + P
    if (isPrintShortcut) {
      e.preventDefault();
      this.router.navigate(['/order/select-product'], {
        queryParams: {v: Date.now()},
        state: {from: 'order-create'}
      });
      return;
    }

    // Abre vista previa en nueva pestaña con Ctrl/Cmd + V
    if (isPreviewShortcut) {
      e.preventDefault();
      this.openPreview();
      return;
    }

    // Ignora eventos si el foco está en un campo de texto
    if (this.isTextLikeTarget(e.target)) return;
  }

  // Método para abrir vista previa en nueva pestaña
  openPreview(): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/order/print'])
    );
    window.open(url, '_blank');
  }

  // Método para generar orden
  generateOrder(): void {
    console.log('Generando orden...');
    // Aquí irá la lógica para generar la orden
  }
}
