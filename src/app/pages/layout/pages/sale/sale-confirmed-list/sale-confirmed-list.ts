import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../../../../modules/sale/services/sale.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { SaleListResponse } from '../../../../../modules/sale/get/models/sale-list-response.model';
import { Summary } from '../../../../../modules/sale/get/models/sale-confirmed-list-response.model';

@Component({
  selector: 'app-sale-confirmed-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './sale-confirmed-list.html',
  styleUrl: './sale-confirmed-list.css'
})
export class SaleConfirmedList implements OnInit, OnDestroy {
  private readonly saleService = inject(SaleService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly sales = signal<SaleListResponse[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly selectedSale = signal<SaleListResponse | null>(null);
  readonly searchUsername = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly isLoading = signal(false);
  readonly activeDropdown = signal<number | null>(null);

  readonly resultInfo = computed(() => {
    const count = this.sales().length;
    const limit = 500;
    return count >= limit
      ? `Mostrando ${count} ventas (límite máximo alcanzado)`
      : `Mostrando ${count} ventas confirmadas`;
  });

  private clickListener?: () => void;

  ngOnInit(): void {
    this.loadSales();
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

  loadSales(): void {
    this.isLoading.set(true);
    const params: any = {};

    const username = this.searchUsername().trim();
    if (username) params.username = username;

    const start = this.startDate();
    const end = this.endDate();

    if (start && end) {
      params.startDate = new Date(start).toISOString();
      params.endDate = new Date(end).toISOString();
    }

    this.saleService.getConfirmedSales(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.sales.set(response.data.sales);
          this.summary.set(response.data.summary);

          if (response.data.sales.length > 0 && !this.selectedSale()) {
            this.selectSale(response.data.sales[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.isLoading.set(false);
      }
    });
  }

  onEnter(): void {
    this.loadSales();
  }

  onSearch(): void {
    this.loadSales();
  }

  clearFilters(): void {
    this.searchUsername.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.loadSales();
  }

  selectSale(sale: SaleListResponse): void {
    this.selectedSale.set(sale);
  }

  toggleDropdown(saleId: number, event: Event): void {
    event.stopPropagation();
    this.activeDropdown.set(
      this.activeDropdown() === saleId ? null : saleId
    );
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  onAddPayment(sale: SaleListResponse): void {
    this.activeDropdown.set(null);

    const pending = sale.totals.pending;
    const amountInput = prompt(
      `Registrar pago para venta ${sale.number}\n\n` +
      `Total: Bs. ${sale.totals.total.toFixed(2)}\n` +
      `Pagado: Bs. ${sale.totals.payment.toFixed(2)}\n` +
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

    this.saleService.createPayment(sale.id, {
      amount: amount,
      userId: currentUser.id
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Pago de Bs. ${amount.toFixed(2)} registrado exitosamente`);
          this.loadSales();
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

  trackBySaleId(_: number, sale: SaleListResponse): number {
    return sale.id;
  }
}