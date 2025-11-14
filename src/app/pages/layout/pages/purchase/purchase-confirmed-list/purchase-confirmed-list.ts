import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { PurchaseService } from '../../../../../modules/purchase/services/purchase.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { PurchaseListResponse } from '../../../../../modules/purchase/get/models/purchase-list-response.model';
import { Summary } from '../../../../../modules/purchase/get/models/purchase-confirmed-list-response.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-confirmed-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './purchase-confirmed-list.html',
  styleUrl: './purchase-confirmed-list.css'
})
export class PurchaseConfirmedList implements OnInit, OnDestroy {
  private readonly purchaseService = inject(PurchaseService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly purchases = signal<PurchaseListResponse[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly selectedPurchase = signal<PurchaseListResponse | null>(null);
  readonly searchUsername = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly isLoading = signal(false);
  readonly activeDropdown = signal<number | null>(null);

  readonly resultInfo = computed(() => {
    const count = this.purchases().length;
    const limit = 500;
    return count >= limit
      ? `Mostrando ${count} compras (límite máximo alcanzado)`
      : `Mostrando ${count} compras confirmadas`;
  });

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
    const params: any = {};

    const username = this.searchUsername().trim();
    if (username) params.username = username;

    const start = this.startDate();
    const end = this.endDate();

    if (start && end) {
      params.startDate = `${start}T00:00:00`;
      params.endDate = `${end}T23:59:59`;

      console.log('Fecha inicio input:', start);
      console.log('Fecha fin input:', end);
      console.log('startDate enviado:', params.startDate);
      console.log('endDate enviado:', params.endDate);
    }

    this.purchaseService.getConfirmedPurchases(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.purchases.set(response.data.purchases);
          this.summary.set(response.data.summary);

          if (response.data.purchases.length > 0 && !this.selectedPurchase()) {
            this.selectPurchase(response.data.purchases[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
        this.isLoading.set(false);
      }
    });
  }

  onEnter(): void {
    this.loadPurchases();
  }

  onSearch(): void {
    this.loadPurchases();
  }

  clearFilters(): void {
    this.searchUsername.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.loadPurchases();
  }

  selectPurchase(purchase: PurchaseListResponse): void {
    this.selectedPurchase.set(purchase);
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

  trackByPurchaseId(_: number, purchase: PurchaseListResponse): number {
    return purchase.id;
  }
}