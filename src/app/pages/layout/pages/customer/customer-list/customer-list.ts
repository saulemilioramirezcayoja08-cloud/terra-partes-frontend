import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../../../modules/customer/services/customer.service';
import { CustomerListResponse } from '../../../../../modules/customer/get/models/customer-list-response.model';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly customers = signal<CustomerListResponse[]>([]);
  readonly selectedCustomer = signal<CustomerListResponse | null>(null);
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
    `Mostrando ${this.customers().length} de ${this.totalElements()} clientes`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  private activeFilters: { name?: string; taxId?: string } = {};

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.activeFilters
    };

    this.customerService.getCustomers(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.customers.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedCustomer()) {
            this.selectCustomer(data.content[0]);
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
    this.loadCustomers();
  }

  toggleSearchMode(mode: 'name' | 'taxId'): void {
    this.searchMode.set(mode);
  }

  selectCustomer(customer: CustomerListResponse): void {
    this.selectedCustomer.set(customer);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadCustomers();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadCustomers();
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

  trackByCustomerId(_: number, customer: CustomerListResponse): number {
    return customer.id;
  }

  trackByOrderId(_: number, order: any): number {
    return order.id;
  }

  trackBySaleId(_: number, sale: any): number {
    return sale.id;
  }
}