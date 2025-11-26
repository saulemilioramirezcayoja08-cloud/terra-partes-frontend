import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductMargin, Summary } from '../../../../../../modules/margin/get/models/margin-report-response.model';
import { MarginService } from '../../../../../../modules/margin/services/margin-service';

@Component({
  selector: 'app-margin-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './margin-report.html',
  styleUrl: './margin-report.css'
})
export class MarginReport implements OnInit {
  private readonly marginService = inject(MarginService);

  readonly products = signal<ProductMargin[]>([]);
  readonly summary = signal<Summary | null>(null);
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly searchUsername = signal('');  // ✨ NUEVO
  readonly isLoading = signal(false);
  readonly selectedProduct = signal<ProductMargin | null>(null);

  readonly resultInfo = computed(() => {
    const count = this.products().length;
    return `${count} productos con movimiento`;
  });

  readonly hasPositiveMargin = computed(() => {
    const summary = this.summary();
    return summary && summary.totalProfit > 0;
  });

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadReport();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate.set(this.formatDate(firstDay));
    this.endDate.set(this.formatDate(lastDay));
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadReport(): void {
    const start = this.startDate();
    const end = this.endDate();

    if (!start || !end) {
      alert('Debe seleccionar ambas fechas');
      return;
    }

    this.isLoading.set(true);

    const params: any = {
      startDate: `${start}T00:00:00`,
      endDate: `${end}T23:59:59`
    };

    const username = this.searchUsername().trim();
    if (username) {
      params.username = username;
    }

    this.marginService.getMarginReport(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data.products);
          this.summary.set(response.data.summary);

          if (response.data.products.length > 0) {
            this.selectProduct(response.data.products[0]);
          } else {
            this.selectedProduct.set(null);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reporte:', error);
        alert('Error al cargar el reporte: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadReport();
  }

  onEnter(): void {
    this.loadReport();
  }

  clearFilters(): void {
    this.searchUsername.set('');
    this.setDefaultDates();
    this.loadReport();
  }

  selectProduct(product: ProductMargin): void {
    this.selectedProduct.set(product);
  }

  getMarginClass(percent: number): string {
    if (percent >= 30) return 'margin-excellent';
    if (percent >= 15) return 'margin-good';
    if (percent >= 5) return 'margin-fair';
    if (percent > 0) return 'margin-low';
    return 'margin-negative';
  }

  trackByProductId(_: number, product: ProductMargin): number {
    return product.productId;
  }
}