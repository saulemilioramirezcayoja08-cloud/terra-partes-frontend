import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { PurchaseListResponse } from '../../../../../modules/purchase/get/models/purchase-list-response.model';
import { Summary } from '../../../../../modules/purchase/get/models/purchase-confirmed-list-response.model';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';

interface ReportData {
  purchases: PurchaseListResponse[];
  summary: Summary;
  filters: {
    username: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  generatedAt: string;
  generatedBy: string;
}

@Component({
  selector: 'app-purchase-confirmed-report',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './purchase-confirmed-report.html',
  styleUrl: './purchase-confirmed-report.css'
})
export class PurchaseConfirmedReport implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly reportData = signal<ReportData | null>(null);

  readonly purchases = computed(() => {
    const purchasesData = this.reportData()?.purchases || [];
    return [...purchasesData].sort((a, b) => a.id - b.id);
  });

  readonly summary = computed(() => this.reportData()?.summary || null);
  readonly filters = computed(() => this.reportData()?.filters || null);
  readonly generatedAt = computed(() => this.reportData()?.generatedAt || '');
  readonly generatedBy = computed(() => this.reportData()?.generatedBy || '');

  readonly formattedDate = computed(() => {
    try {
      const date = new Date(this.generatedAt());
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return new Date().toLocaleDateString('es-BO');
    }
  });

  readonly formattedDateTime = computed(() => {
    try {
      const date = new Date(this.generatedAt());
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch {
      return new Date().toLocaleString('es-BO');
    }
  });

  readonly dateRangeText = computed(() => {
    const filters = this.filters();
    if (!filters?.startDate || !filters?.endDate) return 'Todas las fechas';
    
    try {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const startStr = `${String(start.getDate()).padStart(2, '0')}-${String(start.getMonth() + 1).padStart(2, '0')}-${start.getFullYear()}`;
      const endStr = `${String(end.getDate()).padStart(2, '0')}-${String(end.getMonth() + 1).padStart(2, '0')}-${end.getFullYear()}`;
      return `Del ${startStr} al ${endStr}`;
    } catch {
      return 'Todas las fechas';
    }
  });

  readonly usernameFilterText = computed(() => {
    const username = this.filters()?.username;
    return username || 'Todos los usuarios';
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      const storedData = sessionStorage.getItem('purchase-confirmed-report-data');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          this.reportData.set(data);
          sessionStorage.removeItem('purchase-confirmed-report-data');
          return;
        } catch (error) {
          console.error('Error cargando datos del reporte:', error);
          sessionStorage.removeItem('purchase-confirmed-report-data');
        }
      }
    }
    
    // Fallback a mock data para desarrollo
    this.loadMockData();
  }

  private loadMockData(): void {
    fetch('/assets/mock/purchase-confirmed-report.json')
      .then(r => r.json())
      .then(data => this.reportData.set(data))
      .catch(() => console.log('No se pudo cargar datos mock'));
  }

  formatBolivianDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return isoDate;
    }
  }

  trackByPurchaseId(_: number, purchase: PurchaseListResponse): number {
    return purchase.id;
  }
}