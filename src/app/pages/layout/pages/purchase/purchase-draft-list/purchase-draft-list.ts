import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PurchaseService } from '../../../../../modules/purchase/services/purchase.service';
import { PurchaseListResponse } from '../../../../../modules/purchase/get/models/purchase-list-response.model';
import { Summary } from '../../../../../modules/purchase/get/models/purchase-draft-list-response.model';

@Component({
  selector: 'app-purchase-draft-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './purchase-draft-list.html',
  styleUrl: './purchase-draft-list.css'
})
export class PurchaseDraftList implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  readonly purchases = signal<PurchaseListResponse[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly selectedPurchase = signal<PurchaseListResponse | null>(null);
  readonly searchUsername = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly isLoading = signal(false);

  readonly resultInfo = computed(() => {
    const count = this.purchases().length;
    const limit = 500;
    return count >= limit
      ? `Mostrando ${count} compras (límite máximo alcanzado)`
      : `Mostrando ${count} compras borrador`;
  });

  ngOnInit(): void {
    this.loadPurchases();
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
    }

    this.purchaseService.getDraftPurchases(params).subscribe({
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