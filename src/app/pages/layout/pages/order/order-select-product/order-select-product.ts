import {Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../../../../modules/catalog/services/product.service';
import {Router} from '@angular/router';
import {OrderCartService} from '../../../../../modules/order/services/order-cart-service';
import {ProductListResponse} from '../../../../../modules/catalog/get/models/product-list-response.model';

@Component({
  selector: 'app-order-select-product',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './order-select-product.html',
  styleUrl: './order-select-product.css'
})
export class OrderSelectProduct implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly orderCartService = inject(OrderCartService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly products = signal<ProductListResponse[]>([]);
  readonly selectedProduct = signal<ProductListResponse | null>(null);
  readonly searchTerm = signal('');
  readonly searchMode = signal<'name' | 'code' | 'sku'>('name');
  readonly wildcardActive = signal(false);
  readonly isLoading = signal(false);

  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly hasNext = signal(false);
  readonly hasPrevious = signal(false);

  readonly inCartIds = this.orderCartService.productIds;

  readonly paginationInfo = computed(() =>
    `Mostrando ${this.products().length} de ${this.totalElements()} productos`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

private activeFilters: { name?: string; code?: string; sku?: string } = {};

  private keyboardListener?: (e: KeyboardEvent) => void;

  ngOnInit(): void {
    this.loadProducts();
    if (this.isBrowser) {
      this.setupKeyboardShortcuts();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
    }
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.activeFilters
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.products.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedProduct()) {
            this.selectProduct(data.content[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onEnter(): void {
    this.wildcardActive() ? this.onWildcardSearch() : this.onSearch();
  }

  onSearch(): void {
    const term = this.searchTerm().trim();
    this.activeFilters = {};

    if (term) {
      this.activeFilters[this.searchMode()] = term;
    }

    this.currentPage.set(0);
    this.loadProducts();
  }

  onWildcardSearch(): void {
    const term = this.searchTerm().trim();
    this.activeFilters = {};

    if (term && term.includes('*')) {
      const [namePart, codePart] = term.split('*').map(s => s.trim());
      if (namePart) this.activeFilters.name = namePart;
      if (codePart) this.activeFilters.code = codePart;
    } else if (term) {
      this.activeFilters[this.searchMode()] = term;
    }

    this.currentPage.set(0);
    this.loadProducts();
  }

  toggleSearchMode(mode: 'name' | 'code' | 'sku'): void {
    this.searchMode.set(mode);
  }
  
  toggleWildcard(): void {
    this.wildcardActive.update(v => !v);
  }

  selectProduct(product: ProductListResponse): void {
    this.selectedProduct.set(product);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadProducts();
    }
  }

  isInCart(productId: number): boolean {
    return this.inCartIds().has(productId);
  }

  addProductToOrder(product: ProductListResponse): void {
    if (this.isInCart(product.id)) return;

    this.orderCartService.addDetail({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      uom: product.uom,
      quantity: 1,
      price: product.price,
      subtotal: product.price,
      notes: ''
    });
  }

  getOemCode(product: ProductListResponse): string {
    const oemCode = product.codes.find(c => c.type === 'OEM');
    return oemCode?.code || '-';
  }

  getStockClass(available: number): string {
    if (available === 0) return 'stock-critical';
    if (available < 5) return 'stock-low';
    return '';
  }

  private setupKeyboardShortcuts(): void {
    if (this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
    }

    this.keyboardListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.router.navigate(['/order/create']);
      }
    };

    document.addEventListener('keydown', this.keyboardListener);
  }

  trackByProductId(_: number, product: ProductListResponse): number {
    return product.id;
  }
}
