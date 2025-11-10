import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../../../modules/supplier/services/supplier.service';
import { SupplierListResponse } from '../../../../../modules/supplier/get/models/supplier-list-response.model';

@Component({
  selector: 'app-supplier-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css'
})
export class SupplierList implements OnInit {
  private readonly supplierService = inject(SupplierService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly suppliers = signal<SupplierListResponse[]>([]);
  readonly selectedSupplier = signal<SupplierListResponse | null>(null);
  readonly searchTerm = signal('');
  readonly searchMode = signal<'name' | 'taxId'>('name');
  readonly isLoading = signal(false);

  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly hasNext = signal(false);
  readonly hasPrevious = signal(false);

  readonly paginationInfo = computed(() =>
    `Mostrando ${this.suppliers().length} de ${this.totalElements()} proveedores`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  private activeFilters: { name?: string; taxId?: string } = {};

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.activeFilters
    };

    this.supplierService.getSuppliers(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.suppliers.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedSupplier()) {
            this.selectSupplier(data.content[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    const term = this.searchTerm().trim();
    this.activeFilters = {};

    if (term) this.activeFilters[this.searchMode()] = term;

    this.currentPage.set(0);
    this.loadSuppliers();
  }

  toggleSearchMode(mode: 'name' | 'taxId'): void {
    this.searchMode.set(mode);
  }

  selectSupplier(supplier: SupplierListResponse): void {
    this.selectedSupplier.set(supplier);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadSuppliers();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadSuppliers();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'BORRADOR': return 'status-draft';
      case 'CONFIRMADA': return 'status-confirmed';
      case 'CANCELADA': return 'status-cancelled';
      default: return '';
    }
  }

  trackBySupplierId(_: number, supplier: SupplierListResponse): number {
    return supplier.id;
  }

  trackByPurchaseId(_: number, purchase: any): number {
    return purchase.id;
  }
}