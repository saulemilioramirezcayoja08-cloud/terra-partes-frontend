import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../../../modules/order/services/order.service';
import { OrderListResponse } from '../../../../../modules/order/get/models/order-list-response.model';
import { Summary } from '../../../../../modules/order/get/models/order-draft-list-response.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-draft-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './order-draft-list.html',
  styleUrl: './order-draft-list.css'
})
export class OrderDraftList implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderListResponse[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly selectedOrder = signal<OrderListResponse | null>(null);
  readonly searchUsername = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly isLoading = signal(false);

  readonly resultInfo = computed(() => {
    const count = this.orders().length;
    const limit = 500;
    return count >= limit
      ? `Mostrando ${count} órdenes (límite máximo alcanzado)`
      : `Mostrando ${count} órdenes borrador`;
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const params: any = {};

    const username = this.searchUsername().trim();
    if (username) params.username = username;

    const start = this.startDate();
    const end = this.endDate();

    if (start && end) {
      params.startDate = `${start}T00:00:00`;
      params.endDate = `${end}T23:59:59`;
    }

    this.orderService.getDraftOrders(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(response.data.orders);
          this.summary.set(response.data.summary);

          if (response.data.orders.length > 0 && !this.selectedOrder()) {
            this.selectOrder(response.data.orders[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.isLoading.set(false);
      }
    });
  }

  onEnter(): void {
    this.loadOrders();
  }

  onSearch(): void {
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchUsername.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.loadOrders();
  }

  selectOrder(order: OrderListResponse): void {
    this.selectedOrder.set(order);
  }

  formatBolivianDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return isoDate;
    }
  }

  trackByOrderId(_: number, order: OrderListResponse): number {
    return order.id;
  }
}