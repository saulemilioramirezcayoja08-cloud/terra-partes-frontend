import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OrderService} from '../../../../../modules/order/services/order.service';
import {OrderListResponse} from '../../../../../modules/order/get/models/order-list-response.model';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly orders = signal<OrderListResponse[]>([]);
  readonly selectedOrder = signal<OrderListResponse | null>(null);
  readonly searchTerm = signal('');
  readonly searchMode = signal<'number' | 'username'>('number');
  readonly isLoading = signal(false);

  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly hasNext = signal(false);
  readonly hasPrevious = signal(false);

  readonly paginationInfo = computed(() =>
    `Mostrando ${this.orders().length} de ${this.totalElements()} órdenes`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  private activeFilters: { number?: string; username?: string } = {};

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.activeFilters
    };

    this.orderService.getOrders(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.orders.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedOrder()) {
            this.selectOrder(data.content[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onEnter(): void {
    this.onSearch();
  }

  onSearch(): void {
    const term = this.searchTerm().trim();
    this.activeFilters = {};

    if (term) this.activeFilters[this.searchMode()] = term;

    this.currentPage.set(0);
    this.loadOrders();
  }

  toggleSearchMode(mode: 'number' | 'username'): void {
    this.searchMode.set(mode);
  }

  selectOrder(order: OrderListResponse): void {
    this.selectedOrder.set(order);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadOrders();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadOrders();
    }
  }

  trackByOrderId(_: number, order: OrderListResponse): number {
    return order.id;
  }
}
