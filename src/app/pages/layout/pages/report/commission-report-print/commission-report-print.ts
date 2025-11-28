import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Comision } from '../../../../../modules/report/commission/models/commission-report-response.model';

interface ReportData {
  comisiones: Comision[];
  resumen: any;
  filters: {
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
  generatedAt: string;
  generatedBy: string;
}

@Component({
  selector: 'app-commission-report-print',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './commission-report-print.html',
  styleUrl: './commission-report-print.css'
})
export class CommissionReportPrint implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly reportData = signal<ReportData | null>(null);

  readonly comisiones = computed(() => this.reportData()?.comisiones || []);
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

  readonly statusFilterText = computed(() => {
    const status = this.filters()?.status;
    if (status === 'PENDING') return 'Pendientes';
    if (status === 'PAID') return 'Pagadas';
    return 'Todas';
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      const storedData = sessionStorage.getItem('commission-report-print-data');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          this.reportData.set(data);
          sessionStorage.removeItem('commission-report-print-data');
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

  trackById(_: number, item: Comision): number {
    return item.id;
  }
}
