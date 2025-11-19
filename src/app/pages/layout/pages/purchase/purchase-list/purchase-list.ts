import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseService } from '../../../../../modules/purchase/services/purchase.service';
import { PurchaseListResponse } from '../../../../../modules/purchase/get/models/purchase-list-response.model';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { StatusDisplayPipe } from "../../../../../shared/pipes/status-display-pipe";

@Component({
  selector: 'app-purchase-list',
  imports: [CommonModule, FormsModule, DecimalPipe, StatusDisplayPipe],
  templateUrl: './purchase-list.html',
  styleUrl: './purchase-list.css'
})
export class PurchaseList implements OnInit, OnDestroy {
  private readonly purchaseService = inject(PurchaseService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly purchases = signal<PurchaseListResponse[]>([]);
  readonly selectedPurchase = signal<PurchaseListResponse | null>(null);
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
    `Mostrando ${this.purchases().length} de ${this.totalElements()} compras`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  private activeFilters: { number?: string; username?: string } = {};
  private clickListener?: () => void;

  ngOnInit(): void {
    this.loadPurchases();
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

  loadPurchases(): void {
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.activeFilters
    };

    this.purchaseService.getPurchases(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.purchases.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedPurchase()) {
            this.selectPurchase(data.content[0]);
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
    this.loadPurchases();
  }

  toggleSearchMode(mode: 'number' | 'username'): void {
    this.searchMode.set(mode);
  }

  selectPurchase(purchase: PurchaseListResponse): void {
    this.selectedPurchase.set(purchase);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadPurchases();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadPurchases();
    }
  }

  toggleDropdown(purchaseId: number, event: Event): void {
    event.stopPropagation();
    this.activeDropdown.set(
      this.activeDropdown() === purchaseId ? null : purchaseId
    );
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  canShowActions(purchase: PurchaseListResponse): boolean {
    return true;
  }

  canConfirm(purchase: PurchaseListResponse): boolean {
    return purchase.status === 'BORRADOR' || purchase.status === 'DRAFT';
  }

  canAddPayment(purchase: PurchaseListResponse): boolean {
    return purchase.status === 'BORRADOR' ||
      purchase.status === 'DRAFT' ||
      purchase.status === 'CONFIRMADA' ||
      purchase.status === 'CONFIRMED';
  }

  onConfirmPurchase(purchase: PurchaseListResponse): void {
    this.activeDropdown.set(null);

    const notesInput = prompt(
      'Confirmar compra ' + purchase.number + '\n\nNotas adicionales (opcional):',
      purchase.notes || ''
    );

    if (notesInput === null) return;

    this.isLoading.set(true);

    const payload = notesInput.trim() ? { notes: notesInput.trim() } : undefined;

    this.purchaseService.confirmPurchase(purchase.id, payload).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert('Compra confirmada exitosamente');
          this.loadPurchases();
        }
      },
      error: (error) => {
        alert('Error al confirmar la compra: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  onAddPayment(purchase: PurchaseListResponse): void {
    this.activeDropdown.set(null);

    const pending = purchase.totals.pending;
    const amountInput = prompt(
      `Registrar pago para compra ${purchase.number}\n\n` +
      `Total: Bs. ${purchase.totals.total.toFixed(2)}\n` +
      `Pagado: Bs. ${purchase.totals.payment.toFixed(2)}\n` +
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

    this.purchaseService.createPayment(purchase.id, {
      amount: amount,
      userId: currentUser.id
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Pago de Bs. ${amount.toFixed(2)} registrado exitosamente`);
          this.loadPurchases();
        }
      },
      error: (error) => {
        alert('Error al registrar el pago: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
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

  trackByPurchaseId(_: number, purchase: PurchaseListResponse): number {
    return purchase.id;
  }
}