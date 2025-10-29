import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {ProductService} from '../../../../../modules/catalog/services/product.service';
import {ProductListResponse} from '../../../../../modules/catalog/models/product-list-response.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

type SearchMode = 'name' | 'description' | 'category' | 'code';

@Component({
  selector: 'app-order-select-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-select-product.html',
  styleUrl: './order-select-product.css'
})
export class OrderSelectProduct implements OnInit {
  private router = inject(Router);
  private productService = inject(ProductService);

  // Estado reactivo
  searchQuery = signal('');
  searchMode = signal<SearchMode>('name');
  wildcardActive = signal(false);

  // Datos de productos
  products = signal<ProductListResponse[]>([]);
  selectedProduct = signal<ProductListResponse | null>(null);
  selectedCodes = signal<any[]>([]);

  // Paginación
  currentPage = signal(0);
  pageSize = signal(20);
  totalElements = signal(0);
  totalPages = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  // Estado de carga
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  // Carga productos con los filtros actuales
  loadProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const params: any = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    const query = this.searchQuery().trim();

    if (query) {
      // MODO WILDCARD: Búsqueda multi-campo con asterisco como separador
      if (this.wildcardActive()) {
        // Dividir por asterisco, limpiar espacios y eliminar vacíos
        const parts = query.split('*')
          .map(part => part.trim())
          .filter(part => part.length > 0);

        // Asignar cada parte a los campos disponibles en orden
        if (parts.length > 0) params.name = parts[0];
        if (parts.length > 1) params.description = parts[1];
        if (parts.length > 2) params.categoryName = parts[2];
        if (parts.length > 3) {
          params.code = parts[3];
          params.codeType = 'OEM';  // Tipo por defecto
        }

        // Si hay más de 4 términos, los adicionales se ignoran
        // Orden: name, description, categoryName, code (OEM)

      } else {
        // MODO NORMAL: Búsqueda en un solo campo según searchMode
        switch (this.searchMode()) {
          case 'name':
            params.name = query;
            break;
          case 'description':
            params.description = query;
            break;
          case 'category':
            params.categoryName = query;
            break;
          case 'code':
            params.code = query;
            params.codeType = 'OEM';
            break;
        }
      }
    }

    // Llamar al servicio con los parámetros construidos
    this.productService.listProducts(params).subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          this.products.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);
        } else {
          this.errorMessage.set(response.message);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar productos: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }

  // Cambia el tipo de búsqueda activa
  setSearchMode(mode: SearchMode) {
    // No permitir cambio si wildcard está activo
    if (this.wildcardActive()) {
      return;
    }

    this.searchMode.set(mode);
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  // Alterna el modo de búsqueda con comodines
  toggleWildcard() {
    this.wildcardActive.update(v => !v);
  }

  // Limpia el texto de búsqueda
  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.loadProducts();
  }

  // Actualiza el valor de búsqueda al escribir
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  // Ejecuta la búsqueda al presionar Enter
  @HostListener('keydown.enter')
  onEnterKey() {
    this.currentPage.set(0);
    this.loadProducts();
  }

  // Selecciona un producto
  selectProduct(product: ProductListResponse) {
    this.selectedProduct.set(product);
    this.selectedCodes.set(product.codes);
  }

  // Navegación de paginación
  goToFirstPage() {
    this.currentPage.set(0);
    this.loadProducts();
  }

  goToPreviousPage() {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadProducts();
    }
  }

  goToNextPage() {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadProducts();
    }
  }

  goToLastPage() {
    this.currentPage.set(this.totalPages() - 1);
    this.loadProducts();
  }

  // Devuelve el texto de placeholder dinámico
  getPlaceholder(): string {
    if (this.wildcardActive()) {
      return 'Ej: amortiguador * trasero * repuestos * 12345';
    }

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
      return 'Separa términos con asterisco (*) para búsquedas flexibles. Ejemplo: "brazo * biela * motor * 12345" buscará en nombre, descripción, categoría y código OEM respectivamente.';
    }

    const helpTexts: Record<SearchMode, string> = {
      name: 'Escribe parte del nombre del producto y presiona Enter. Ejemplo: "brazo biela" encontrará "BRAZO BIELA K10B K14B CELERIO/BALENO".',
      description: 'Busca en las descripciones detalladas de productos. Ejemplo: "compatible K10B".',
      category: 'Filtra productos por su categoría. Ejemplo: "Repuestos Motor".',
      code: 'Busca productos por su código OEM específico.'
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
