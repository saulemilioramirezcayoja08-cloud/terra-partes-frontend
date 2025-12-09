import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Venta } from '../../../../../modules/report/grossmargin/models/gross-margin-report-response.model';

interface ReportData {
  ventas: Venta[];
  resumen: any;
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  generatedAt: string;
  generatedBy: string;
}


@Component({
  selector: 'app-gross-margin-report-print',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './gross-margin-report-print.html',
  styleUrl: './gross-margin-report-print.css'
})
export class GrossMarginReportPrint implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly reportData = signal<ReportData | null>(null);

  readonly ventas = computed(() => this.reportData()?.ventas || []);
  readonly resumen = computed(() => this.reportData()?.resumen || null);
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

  ngOnInit(): void {
    if (this.isBrowser) {
      const storedData = sessionStorage.getItem('gross-margin-report-print-data');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          this.reportData.set(data);
          sessionStorage.removeItem('gross-margin-report-print-data');
        } catch (error) {
          console.error('Error cargando datos del reporte:', error);
        }
      }
    }
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

  trackById(_: number, item: Venta): number {
    return item.id;
  }
}