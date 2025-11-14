import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SaleService } from '../../../../../modules/sale/services/sale.service';
import { SaleListResponse } from '../../../../../modules/sale/get/models/sale-list-response.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Summary } from '../../../../../modules/sale/get/models/sale-draft-list-response.model';

@Component({
  selector: 'app-sale-draft-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './sale-draft-list.html',
  styleUrl: './sale-draft-list.css'
})
export class SaleDraftList implements OnInit {
  private readonly saleService = inject(SaleService);

  readonly sales = signal<SaleListResponse[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly selectedSale = signal<SaleListResponse | null>(null);
  readonly searchUsername = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly isLoading = signal(false);

  readonly resultInfo = computed(() => {
    const count = this.sales().length;
    const limit = 500;
    return count >= limit
      ? `Mostrando ${count} ventas (límite máximo alcanzado)`
      : `Mostrando ${count} ventas borrador`;
  });

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
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

    this.saleService.getDraftSales(params).subscribe({
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