import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../../../../modules/sale/services/sale.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { SaleListResponse } from '../../../../../modules/sale/get/models/sale-list-response.model';
import { StatusDisplayPipe } from "../../../../../shared/pipes/status-display-pipe";

@Component({
  selector: 'app-sale-list',
  imports: [CommonModule, FormsModule, DecimalPipe, StatusDisplayPipe],
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.css'
})
export class SaleList implements OnInit, OnDestroy {
  private readonly saleService = inject(SaleService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly sales = signal<SaleListResponse[]>([]);
  readonly selectedSale = signal<SaleListResponse | null>(null);
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
    `Mostrando ${this.sales().length} de ${this.totalElements()} ventas`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  private activeFilters: { number?: string; username?: string } = {};
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
    const params: any = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.activeFilters
    };

    this.saleService.getSales(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.sales.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedSale()) {
            this.selectSale(data.content[0]);
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
    this.loadSales();
  }

  toggleSearchMode(mode: 'number' | 'username'): void {
    this.searchMode.set(mode);
  }

  selectSale(sale: SaleListResponse): void {
    this.selectedSale.set(sale);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadSales();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadSales();
    }
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

  canShowActions(sale: SaleListResponse): boolean {
    return true;
  }

  canConfirm(sale: SaleListResponse): boolean {
    const isDraft = sale.status === 'BORRADOR' || sale.status === 'DRAFT';
    const isPaidInFull = sale.totals.pending === 0;
    const isCredit = sale.payment.name === 'Credito';

    return isDraft && (isPaidInFull || isCredit);
  }

  canAddPayment(sale: SaleListResponse): boolean {
    const hasPendingAmount = sale.totals.pending > 0;
    const isCredit = sale.payment.name === 'Credito';
    const isDraft = sale.status === 'BORRADOR' || sale.status === 'DRAFT';
    const isConfirmed = sale.status === 'CONFIRMADA' || sale.status === 'CONFIRMED';

    if (isDraft) return hasPendingAmount;
    if (isConfirmed) return isCredit && hasPendingAmount;

    return false;
  }

  canCancel(sale: SaleListResponse): boolean {
    const isDraft = sale.status === 'BORRADOR' || sale.status === 'DRAFT';
    return isDraft;
  }

  onConfirmSale(sale: SaleListResponse): void {
    this.activeDropdown.set(null);

    const commissionInput = prompt(
      'Confirmar venta ' + sale.number + '\n\n' +
      'Porcentaje de comisión (0-100):',
      '30'
    );

    if (commissionInput === null) return;

    const commissionRate = parseInt(commissionInput.trim());

    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      alert('El porcentaje de comisión debe ser un número entre 0 y 100');
      return;
    }

    const notesInput = prompt(
      'Notas adicionales (opcional):',
      sale.notes || ''
    );

    if (notesInput === null) return;

    this.isLoading.set(true);

    const payload: any = { commissionRate };
    if (notesInput.trim()) {
      payload.notes = notesInput.trim();
    }

    this.saleService.confirmSale(sale.id, payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Venta confirmada exitosamente con comisión del ${commissionRate}%`);
          this.loadSales();
        }
      },
      error: (error) => {
        alert('Error al confirmar la venta: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
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
        alert('Error al registrar el pago: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  onCancelSale(sale: SaleListResponse): void {
    this.activeDropdown.set(null);

    const confirmation = confirm(
      `¿Está seguro que desea anular la venta ${sale.number}?\n\n` +
      `Esta acción marcará:\n` +
      `- La venta como ANULADA\n` +
      `- La orden asociada como ANULADA\n` +
      `- Las reservas como ANULADAS\n\n` +
      `Todo permanecerá en el histórico pero no podrá ser confirmado.`
    );

    if (!confirmation) return;

    const notesInput = prompt(
      'Motivo de cancelación (opcional):',
      ''
    );

    if (notesInput === null) return;

    this.isLoading.set(true);

    const payload = notesInput.trim() ? { notes: notesInput.trim() } : undefined;

    this.saleService.cancelSale(sale.id, payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert('Venta anulada exitosamente');
          this.loadSales();
        }
      },
      error: (error) => {
        alert('Error al anular la venta: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  onPrintSale(sale: SaleListResponse): void {
    this.activeDropdown.set(null);

    sessionStorage.setItem('sale-print-data', JSON.stringify(sale));

    window.open('/sale/reprint', '_blank');
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

  trackBySaleId(_: number, sale: SaleListResponse): number {
    return sale.id;
  }
}