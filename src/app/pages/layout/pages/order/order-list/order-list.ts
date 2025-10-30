import {Component, inject, OnInit, signal} from '@angular/core';
import {OrderListParams, OrderService} from '../../../../../modules/orders/services/order.service';
import {OrderListResponse} from '../../../../../modules/orders/models/order-list-response.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList implements OnInit {
  private orderService = inject(OrderService);

  filterStartDate = '';
  filterEndDate = '';
  filterUsername = '';
  filterNotes = '';
  filterNumber = '';
  filterCustomerName = '';
  filterWarehouse = '';
  filterPaymentName = '';

  orders = signal<OrderListResponse[]>([]);
  selectedOrder = signal<OrderListResponse | null>(null);

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const params: OrderListParams = {
      page: this.currentPage(),
      size: 20,
      sort: 'id,desc'
    };

    if (this.filterNumber) params.number = this.filterNumber;
    if (this.filterUsername) params.username = this.filterUsername;
    if (this.filterCustomerName) params.customerName = this.filterCustomerName;
    if (this.filterPaymentName) params.paymentName = this.filterPaymentName;
    if (this.filterWarehouse) params.warehouseName = this.filterWarehouse;
    if (this.filterNotes) params.notes = this.filterNotes;

    if (this.filterStartDate && this.filterEndDate) {
      params.startDate = this.formatStartDate(this.filterStartDate);
      params.endDate = this.formatEndDate(this.filterEndDate);
    }

    this.orderService.listOrders(params).subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          this.orders.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length === 0) {
            this.selectedOrder.set(null);
          }
        } else {
          this.errorMessage.set(response.message || 'Error al cargar las órdenes');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al conectar con el servidor');
        this.isLoading.set(false);
        console.error('Error loading orders:', error);
      }
    });
  }

  search() {
    if ((this.filterStartDate && !this.filterEndDate) || (!this.filterStartDate && this.filterEndDate)) {
      this.errorMessage.set('Debe proporcionar ambas fechas (desde y hasta) o ninguna');
      return;
    }

    this.currentPage.set(0);
    this.selectedOrder.set(null);
    this.loadOrders();
  }

  clear() {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterUsername = '';
    this.filterNotes = '';
    this.filterNumber = '';
    this.filterCustomerName = '';
    this.filterWarehouse = '';
    this.filterPaymentName = '';
    this.currentPage.set(0);
    this.selectedOrder.set(null);
    this.errorMessage.set(null);
    this.loadOrders();
  }

  selectOrder(order: OrderListResponse) {
    this.selectedOrder.set(order);
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage.update(page => page + 1);
      this.loadOrders();
    }
  }

  previousPage() {
    if (this.hasPrevious()) {
      this.currentPage.update(page => page - 1);
      this.loadOrders();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatStartDate(date: string): string {
    return `${date}T00:00:00`;
  }

  private formatEndDate(date: string): string {
    return `${date}T23:59:59`;
  }
}
