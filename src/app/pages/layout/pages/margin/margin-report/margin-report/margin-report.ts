import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarginService } from '../../../../../../modules/margin/services/margin-service';
import { MarginReportResponse, ProductMargin } from '../../../../../../modules/margin/get/models/margin-report-response.model';

@Component({
  selector: 'app-margin-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './margin-report.html',
  styleUrl: './margin-report.css'
})
export class MarginReport implements OnInit {
  private readonly marginService = inject(MarginService);

  readonly products = signal<ProductMargin[]>([]);
  readonly summary = signal<MarginReportResponse['summary'] | null>(null);
  readonly selectedProduct = signal<ProductMargin | null>(null);
  readonly isLoading = signal(false);

  readonly skuSearch = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');

  readonly statusFilter = signal<'ALL' | 'PROFITABLE' | 'LOW_MARGIN' | 'NO_MARGIN' | 'LOSS'>('ALL');

  readonly filteredProducts = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'ALL') return this.products();
    return this.products().filter(p => p.margin.status === filter);
  });

  ngOnInit(): void {
    this.loadMarginReport();
  }

  loadMarginReport(): void {
    this.isLoading.set(true);
    const params: any = {};

    const sku = this.skuSearch().trim();
    if (sku) params.sku = sku;

    const start = this.startDate();
    const end = this.endDate();
    if (start) params.startDate = start;
    if (end) params.endDate = end;

    this.marginService.getMarginReport(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data.products);
          this.summary.set(response.data.summary);

          if (response.data.products.length > 0 && !this.selectedProduct()) {
            this.selectProduct(response.data.products[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    this.loadMarginReport();
  }

  selectProduct(product: ProductMargin): void {
    this.selectedProduct.set(product);
  }

  toggleStatusFilter(status: 'ALL' | 'PROFITABLE' | 'LOW_MARGIN' | 'NO_MARGIN' | 'LOSS'): void {
    this.statusFilter.set(status);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PROFITABLE': 'status-profitable',
      'LOW_MARGIN': 'status-low',
      'NO_MARGIN': 'status-no-margin',
      'LOSS': 'status-loss'
    };
    return statusMap[status] || '';
  }

  getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      'PROFITABLE': 'RENTABLE',
      'LOW_MARGIN': 'MARGEN BAJO',
      'NO_MARGIN': 'SIN MARGEN',
      'LOSS': 'PÉRDIDA'
    };
    return labelMap[status] || status;
  }

  trackByProductId(_: number, product: ProductMargin): number {
    return product.productId;
  }
}