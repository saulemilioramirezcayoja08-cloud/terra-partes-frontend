import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../../../../modules/catalog/services/product.service';
import {ProductListResponse} from '../../../../../modules/catalog/get/models/product-list-response.model';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { AddCodeRequest, CodeItem } from '../../../../../modules/catalog/codes/models/add-code-request.model';
import { UpdateProductRequest } from '../../../../../modules/catalog/patch/models/update-product-request.model';
import { UpdateCodeRequest } from '../../../../../modules/catalog/codes/models/update-code-request.model';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
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

  // Modales
  readonly showEditProductModal = signal(false);
  readonly showAddCodeModal = signal(false);
  readonly showEditCodeModal = signal(false);

  // Formularios
  readonly editForm = signal({
    sku: '',
    name: '',
    categoryId: null as number | null,
    uom: ''
  });

  readonly newCode = signal({
    type: '',
    code: ''
  });

  readonly editCode = signal({
    id: 0,
    type: '',
    code: ''
  });

  readonly paginationInfo = computed(() =>
    `Mostrando ${this.products().length} de ${this.totalElements()} productos`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

private activeFilters: { name?: string; code?: string; sku?: string } = {};
  ngOnInit(): void {
    this.loadProducts();
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

    if (term) this.activeFilters[this.searchMode()] = term;

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

  getOemCode(product: ProductListResponse): string {
    const oemCode = product.codes.find(c => c.type === 'OEM');
    return oemCode?.code || '-';
  }

  getStockClass(available: number): string {
    if (available === 0) return 'stock-critical';
    if (available < 5) return 'stock-low';
    return '';
  }

  trackByProductId(_: number, product: ProductListResponse): number {
    return product.id;
  }

  // === EDITAR PRODUCTO ===
  openEditProductModal(): void {
    const product = this.selectedProduct();
    if (!product) return;

    this.editForm.set({
      sku: product.sku,
      name: product.name,
      categoryId: product.category?.id || null,
      uom: product.uom
    });
    this.showEditProductModal.set(true);
  }

  closeEditProductModal(): void {
    this.showEditProductModal.set(false);
  }

  saveProduct(): void {
    const product = this.selectedProduct();
    if (!product) return;

    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      alert('Usuario no autenticado');
      return;
    }

    const form = this.editForm();
    const payload: UpdateProductRequest = {
      sku: form.sku || undefined,
      name: form.name || undefined,
      categoryId: form.categoryId || undefined,
      uom: form.uom || undefined,
      userId: currentUser.id
    };

    this.productService.updateProduct(product.id, payload).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Producto actualizado correctamente');
          this.closeEditProductModal();
          this.loadProducts();
        }
      },
      error: (error) => {
        alert(this.errorHandler.handleError(error, 'Error al actualizar producto'));
      }
    });
  }

  // === AGREGAR CÓDIGO ===
  openAddCodeModal(): void {
    this.newCode.set({ type: '', code: '' });
    this.showAddCodeModal.set(true);
  }

  closeAddCodeModal(): void {
    this.showAddCodeModal.set(false);
  }

  addCode(): void {
    const product = this.selectedProduct();
    if (!product) return;

    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      alert('Usuario no autenticado');
      return;
    }

    const newCodeData = this.newCode();
    if (!newCodeData.type || !newCodeData.code) {
      alert('Tipo y código son requeridos');
      return;
    }

    const payload: AddCodeRequest = {
      codes: [{ type: newCodeData.type, code: newCodeData.code }],
      userId: currentUser.id
    };

    this.productService.addCodes(product.id, payload).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Código agregado correctamente');
          this.closeAddCodeModal();
          this.loadProducts();
        }
      },
      error: (error) => {
        alert(this.errorHandler.handleError(error, 'Error al agregar código'));
      }
    });
  }

  // === EDITAR CÓDIGO ===
  openEditCodeModal(code: any): void {
    this.editCode.set({
      id: code.id,
      type: code.type,
      code: code.code
    });
    this.showEditCodeModal.set(true);
  }

  closeEditCodeModal(): void {
    this.showEditCodeModal.set(false);
  }

  updateCode(): void {
    const product = this.selectedProduct();
    if (!product) return;

    const codeData = this.editCode();
    const payload: UpdateCodeRequest = {
      type: codeData.type || undefined,
      code: codeData.code || undefined
    };

    this.productService.updateCode(product.id, codeData.id, payload).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Código actualizado correctamente');
          this.closeEditCodeModal();
          this.loadProducts();
        }
      },
      error: (error) => {
        alert(this.errorHandler.handleError(error, 'Error al actualizar código'));
      }
    });
  }
}