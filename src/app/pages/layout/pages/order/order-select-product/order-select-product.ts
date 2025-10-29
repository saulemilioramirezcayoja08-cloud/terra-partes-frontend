import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {ProductService} from '../../../../../modules/catalog/services/product.service';
import {ProductListResponse} from '../../../../../modules/catalog/models/product-list-response.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OrderCartService} from '../../../../../modules/orders/services/order-cart-service';

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
  private orderCartService = inject(OrderCartService);

  searchQuery = signal('');
  searchMode = signal<SearchMode>('name');
  wildcardActive = signal(false);

  products = signal<ProductListResponse[]>([]);
  selectedProduct = signal<ProductListResponse | null>(null);
  selectedCodes = signal<any[]>([]);

  currentPage = signal(0);
  pageSize = signal(20);
  totalElements = signal(0);
  totalPages = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const params: any = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    const query = this.searchQuery().trim();

    if (query) {
      if (this.wildcardActive()) {
        const parts = query.split('*')
          .map(part => part.trim())
          .filter(part => part.length > 0);

        if (parts.length > 0) params.name = parts[0];
        if (parts.length > 1) params.description = parts[1];
        if (parts.length > 2) params.categoryName = parts[2];
        if (parts.length > 3) {
          params.code = parts[3];
          params.codeType = 'OEM';
        }

      } else {
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

  setSearchMode(mode: SearchMode) {
    if (this.wildcardActive()) {
      return;
    }

    this.searchMode.set(mode);
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  toggleWildcard() {
    this.wildcardActive.update(v => !v);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  @HostListener('keydown.enter')
  onEnterKey() {
    this.currentPage.set(0);
    this.loadProducts();
  }

  selectProduct(product: ProductListResponse) {
    this.selectedProduct.set(product);
    this.selectedCodes.set(product.codes);
  }

  addProductToCart(product: ProductListResponse): void {
    this.orderCartService.addProduct(product);

    this.router.navigate(['/order/create']);
  }

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

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.router.navigate(['/order/create']);
    }
  }
}
