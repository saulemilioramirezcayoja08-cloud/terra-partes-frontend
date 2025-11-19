import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../../modules/order/services/order.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { OrderListResponse } from '../../../../../modules/order/get/models/order-list-response.model';
import { Summary } from '../../../../../modules/order/get/models/order-draft-list-response.model';
import { StatusDisplayPipe } from "../../../../../shared/pipes/status-display-pipe";

@Component({
  selector: 'app-order-confirmed-list',
  imports: [CommonModule, FormsModule, DecimalPipe, StatusDisplayPipe],
  templateUrl: './order-confirmed-list.html',
  styleUrl: './order-confirmed-list.css'
})
export class OrderConfirmedList implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly orders = signal<OrderListResponse[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly selectedOrder = signal<OrderListResponse | null>(null);
  readonly searchUsername = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly isLoading = signal(false);
  readonly activeDropdown = signal<number | null>(null);

  readonly resultInfo = computed(() => {
    const count = this.orders().length;
    const limit = 500;
    return count >= limit
      ? `Mostrando ${count} órdenes (límite máximo alcanzado)`
      : `Mostrando ${count} órdenes confirmadas`;
  });

  private clickListener?: () => void;

  ngOnInit(): void {
    this.loadOrders();
    if (this.isBrowser) {
      this.clickListener = () => this.closeDropdown();
      document.addEventListener('click', this.clickListener);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
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

    this.orderService.getConfirmedOrders(params).subscribe({
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

  toggleDropdown(orderId: number, event: Event): void {
    event.stopPropagation();
    this.activeDropdown.set(
      this.activeDropdown() === orderId ? null : orderId
    );
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  onAddPayment(order: OrderListResponse): void {
    this.activeDropdown.set(null);

    const pending = order.totals.pending;
    const amountInput = prompt(
      `Registrar pago para orden ${order.number}\n\n` +
      `Total: Bs. ${order.totals.total.toFixed(2)}\n` +
      `Pagado: Bs. ${order.totals.payment.toFixed(2)}\n` +
      `Pendiente: Bs. ${pending.toFixed(2)}\n\n` +
      `Ingrese el monto a pagar:`
    );

    if (amountInput === null) return;

    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
      alert('El monto debe ser un número positivo');
      return;
    }

    if (amount > pending) {
      alert(`El monto no puede exceder el saldo pendiente de Bs. ${pending.toFixed(2)}`);
      return;
    }

    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      alert('Usuario no autenticado');
      return;
    }

    this.isLoading.set(true);

    this.orderService.createPayment(order.id, {
      amount: amount,
      userId: currentUser.id
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Pago de Bs. ${amount.toFixed(2)} registrado exitosamente`);
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        alert('Error al registrar el pago: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
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