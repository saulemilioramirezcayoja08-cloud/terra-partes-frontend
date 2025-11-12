import {Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {OrderService} from '../../../../../modules/order/services/order.service';
import {OrderListResponse} from '../../../../../modules/order/get/models/order-list-response.model';
import {AuthService} from '../../../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css'
})
export class OrderList implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly orders = signal<OrderListResponse[]>([]);
  readonly selectedOrder = signal<OrderListResponse | null>(null);
  readonly searchTerm = signal('');
  readonly searchMode = signal<'number' | 'username'>('number');
  readonly isLoading = signal(false);
  readonly activeDropdown = signal<number | null>(null);

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

  toggleDropdown(orderId: number, event: Event): void {
    event.stopPropagation();
    this.activeDropdown.set(
      this.activeDropdown() === orderId ? null : orderId
    );
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  canShowActions(order: OrderListResponse): boolean {
    return true;
  }

  canConfirm(order: OrderListResponse): boolean {
    return order.status === 'BORRADOR' || order.status === 'DRAFT';
  }

  onConfirmOrder(order: OrderListResponse): void {
    this.activeDropdown.set(null);

    const notesInput = prompt(
      'Confirmar orden ' + order.number + '\n\nNotas adicionales (opcional):',
      order.notes || ''
    );

    if (notesInput === null) return;

    this.isLoading.set(true);

    const payload = notesInput.trim() ? {notes: notesInput.trim()} : undefined;

    this.orderService.confirmOrder(order.id, payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert('Orden confirmada exitosamente');
          this.loadOrders();
        }
      },
      error: (error) => {
        alert('Error al confirmar la orden: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
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
        alert('Error al registrar el pago: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  onPrintOrder(order: OrderListResponse): void {
    this.activeDropdown.set(null);
    
    sessionStorage.setItem('order-print-data', JSON.stringify(order));
    
    window.open('/order/reprint', '_blank');
  }

  formatBolivianDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);

      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();

      const bolivianDate = new Date(Date.UTC(year, month, day, hours, minutes));
      bolivianDate.setHours(bolivianDate.getHours());

      const dd = String(bolivianDate.getDate()).padStart(2, '0');
      const mm = String(bolivianDate.getMonth() + 1).padStart(2, '0');
      const yyyy = bolivianDate.getFullYear();
      const hh = String(bolivianDate.getHours()).padStart(2, '0');
      const min = String(bolivianDate.getMinutes()).padStart(2, '0');

      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch (error) {
      return isoDate;
    }
  }

  trackByOrderId(_: number, order: OrderListResponse): number {
    return order.id;
  }
}
