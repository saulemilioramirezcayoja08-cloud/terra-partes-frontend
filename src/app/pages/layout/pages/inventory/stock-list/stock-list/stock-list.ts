import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InventoryService } from '../../../../../../modules/inventory/services/inventory-service';
import { StockListResponse } from '../../../../../../modules/inventory/get/models/stock-list-response.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.css'
})
export class StockList implements OnInit {
  private readonly inventoryService = inject(InventoryService);

  readonly stocks = signal<StockListResponse[]>([]);
  readonly selectedStock = signal<StockListResponse | null>(null);
  readonly warehouseCodeSearch = signal('');
  readonly productSkuSearch = signal('');
  readonly isLoading = signal(false);

  readonly alertCounts = computed(() => {
    const stocks = this.stocks();
    return {
      critical: stocks.filter(s => s.alertSeverity === 'CRITICAL').length,
      warning: stocks.filter(s => s.alertSeverity === 'WARNING').length,
      info: stocks.filter(s => s.alertSeverity === 'INFO').length
    };
  });

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.isLoading.set(true);
    const params: any = {};

    const warehouseCode = this.warehouseCodeSearch().trim();
    if (warehouseCode) params.warehouseCode = warehouseCode;

    const productSku = this.productSkuSearch().trim();
    if (productSku) params.productSku = productSku;

    this.inventoryService.getStock(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stocks.set(response.data);
          if (response.data.length > 0 && !this.selectedStock()) {
            this.selectStock(response.data[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    this.loadStocks();
  }

  selectStock(stock: StockListResponse): void {
    this.selectedStock.set(stock);
  }

  getAlertClass(severity: string | null): string {
    if (!severity) return '';
    return severity.toLowerCase();
  }

  trackByIndex(index: number): number {
    return index;
  }
}