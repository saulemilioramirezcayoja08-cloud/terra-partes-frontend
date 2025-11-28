import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommissionReportService } from '../../../../../modules/report/commission/services/commission-report-service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { Comision } from '../../../../../modules/report/commission/models/commission-report-response.model';

@Component({
  selector: 'app-commission-report',
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './commission-report.html',
  styleUrl: './commission-report.css'
})
export class CommissionReport implements OnInit {
  private readonly commissionService = inject(CommissionReportService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly comisiones = signal<Comision[]>([]);
  readonly resumen = signal<any>(null);
  readonly isLoading = signal(false);

  readonly statusFilter = signal<string>('ALL');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  readonly summary = computed(() => {
    const res = this.resumen();
    if (!res) return null;
    return {
      totalPendiente: res.totalPendiente || 0,
      totalPagado: res.totalPagado || 0,
      cantidadPendiente: res.cantidadPendiente || 0,
      cantidadPagada: res.cantidadPagada || 0
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
    
    if (this.statusFilter() !== 'ALL') {
      params.status = this.statusFilter();
    }
    
    if (this.startDate()) {
      params.startDate = this.startDate();
    }
    
    if (this.endDate()) {
      params.endDate = this.endDate();
    }

    this.commissionService.getCommissionsReport(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.comisiones.set(response.data.comisiones);
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
      comisiones: this.comisiones(),
      resumen: this.resumen(),
      filters: {
        status: this.statusFilter(),
        startDate: this.startDate(),
        endDate: this.endDate()
      },
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.username || 'Sistema'
    };

    sessionStorage.setItem('commission-report-print-data', JSON.stringify(reportData));
    window.open('/report/commission-print', '_blank');
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

  translateStatus(status: string): string {
    return status === 'PENDIENTE' ? 'PENDIENTE' : 'PAGADO';
  }

  trackById(_: number, item: Comision): number {
    return item.id;
  }
}