import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { GrossMarginReportService } from '../../../../../../modules/report/grossmargin/services/gross-margin-report-service';
import { AuthService } from '../../../../../../modules/auth/services/auth.service';
import { Router } from '@angular/router';
import { Venta } from '../../../../../../modules/report/grossmargin/models/gross-margin-report-response.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gross-margin-report',
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './gross-margin-report.html',
  styleUrl: './gross-margin-report.css'
})
export class GrossMarginReport implements OnInit {
  private readonly grossMarginService = inject(GrossMarginReportService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly ventas = signal<Venta[]>([]);
  readonly resumen = signal<any>(null);
  readonly isLoading = signal(false);

  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  readonly summary = computed(() => {
    const res = this.resumen();
    if (!res) return null;
    return {
      totalVentas: res.totalVentas || 0,
      totalCostos: res.totalCostos || 0,
      totalMargen: res.totalMargen || 0,
      porcentajeMargen: res.porcentajeMargen || 0,
      totalPagado: res.totalPagado || 0,
      totalPendiente: res.totalPendiente || 0,
      cantidadVentas: res.cantidadVentas || 0
    };
  });

  ngOnInit(): void {
    this.setCurrentMonth();
    this.loadReport();
  }

  setCurrentMonth(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    this.startDate.set(`${year}-${month}-01`);
    
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    this.endDate.set(`${year}-${month}-${lastDay}`);
  }

  loadReport(): void {
    this.isLoading.set(true);

    const params: any = {};
    
    if (this.startDate()) {
      params.startDate = this.startDate();
    }
    
    if (this.endDate()) {
      params.endDate = this.endDate();
    }

    this.grossMarginService.getGrossMarginReport(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.ventas.set(response.data.ventas);
          this.resumen.set(response.data.resumen);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPrint(): void {
    const currentUser = this.authService.currentUser;
    
    const reportData = {
      ventas: this.ventas(),
      resumen: this.resumen(),
      filters: {
        startDate: this.startDate(),
        endDate: this.endDate()
      },
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.username || 'Sistema'
    };

    sessionStorage.setItem('gross-margin-report-print-data', JSON.stringify(reportData));
    window.open('/report/gross-margin-print', '_blank');
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