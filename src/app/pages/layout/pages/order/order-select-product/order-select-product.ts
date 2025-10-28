import {Component, HostListener, inject, signal} from '@angular/core';
import {Router} from '@angular/router';

type SearchMode = 'name' | 'description' | 'category' | 'code';

@Component({
  selector: 'app-order-select-product',
  imports: [],
  templateUrl: './order-select-product.html',
  styleUrl: './order-select-product.css'
})
export class OrderSelectProduct {
  private router = inject(Router);

  // Estado reactivo
  searchQuery = signal('');
  searchMode = signal<SearchMode>('name');
  wildcardActive = signal(false);

  // Cambia el tipo de búsqueda activa
  setSearchMode(mode: SearchMode) {
    this.searchMode.set(mode);
    this.searchQuery.set('');
  }

  // Alterna el modo de búsqueda con comodines
  toggleWildcard() {
    this.wildcardActive.update(v => !v);
  }

  // Limpia el texto de búsqueda
  clearSearch() {
    this.searchQuery.set('');
  }

  // Actualiza el valor de búsqueda al escribir
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  // Devuelve el texto de placeholder dinámico
  getPlaceholder(): string {
    if (this.wildcardActive()) return 'Ej: amortiguador * trasero * sin categoría';
    const placeholders: Record<SearchMode, string> = {
      name: 'Buscar por nombre del producto...',
      description: 'Buscar por descripción del producto...',
      category: 'Buscar por categoría...',
      code: 'Buscar por código OEM...'
    };
    return placeholders[this.searchMode()];
  }

  // Devuelve el texto de ayuda según el modo actual
  getHelpText(): string {
    if (this.wildcardActive()) {
      return 'Modo comodín: Separa términos con * (Ej: producto * descripción * categoría)';
    }
    const helpTexts: Record<SearchMode, string> = {
      name: 'Buscando en: Nombre del producto',
      description: 'Buscando en: Descripción del producto',
      category: 'Buscando en: Categoría',
      code: 'Buscando en: Código OEM'
    };
    return helpTexts[this.searchMode()];
  }

  // Retorna a OrderCreate al presionar la tecla Escape
  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.router.navigate(['/order/create']);
    }
  }
}
