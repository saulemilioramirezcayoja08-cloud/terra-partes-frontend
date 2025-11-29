import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountsReceivableReportService } from '../../../../../modules/report/accountsreceivable/services/accounts-receivable-report-service';
import { CustomerService } from '../../../../../modules/customer/services/customer.service';
import { PaymentService } from '../../../../../modules/payment/services/payment.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { Router } from '@angular/router';
import { Cuenta } from '../../../../../modules/report/accountsreceivable/models/accounts-receivable-report-response.model';
import { CustomerListResponse } from '../../../../../modules/customer/get/models/customer-list-response.model';
import { PaymentListResponse } from '../../../../../modules/payment/get/models/payment-list-response.model';

@Component({
  selector: 'app-accounts-receivable-report',
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './accounts-receivable-report.html',
  styleUrl: './accounts-receivable-report.css'
})
export class AccountsReceivableReport implements OnInit {
  private readonly reportService = inject(AccountsReceivableReportService);
  private readonly customerService = inject(CustomerService);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cuentas = signal<Cuenta[]>([]);
  readonly resumen = signal<any>(null);
  readonly isLoading = signal(false);

  readonly customers = signal<CustomerListResponse[]>([]);
  readonly payments = signal<PaymentListResponse[]>([]);

  readonly customerIdFilter = signal<number | null>(null);
  readonly paymentIdFilter = signal<number | null>(null);
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');

  readonly summary = computed(() => {
    const res = this.resumen();
    if (!res) return null;
    return {
      totalPorCobrar: res.totalPorCobrar || 0,
      cantidadVentas: res.cantidadVentas || 0,
      cantidadClientes: res.cantidadClientes || 0
    };
  });

  ngOnInit(): void {
    this.loadMasterData();
    this.setCurrentMonth();
    this.loadReport();
  }

  private loadMasterData(): void {
    this.customerService.getCustomers({ size: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customers.set(response.data.content);
        }
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
      }
    });

    this.paymentService.getPayments({ size: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payments.set(response.data.content);
        }
      },
      error: (error) => {
        console.error('Error cargando formas de pago:', error);
      }
    });
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
    
    if (this.customerIdFilter()) {
      params.customerId = this.customerIdFilter();
    }
    
    if (this.paymentIdFilter()) {
      params.paymentId = this.paymentIdFilter();
    }
    
    if (this.startDate()) {
      params.startDate = this.startDate();
    }
    
    if (this.endDate()) {
      params.endDate = this.endDate();
    }

    this.reportService.getAccountsReceivableReport(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cuentas.set(response.data.cuentas);
          this.resumen.set(response.data.resumen);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando reporte:', error);
        this.isLoading.set(false);
      }
    });
  }

  onPrint(): void {
    const currentUser = this.authService.currentUser;
    
    const reportData = {
      cuentas: this.cuentas(),
      resumen: this.resumen(),
      filters: {
        customerId: this.customerIdFilter(),
        paymentId: this.paymentIdFilter(),
        startDate: this.startDate(),
        endDate: this.endDate()
      },
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser?.username || 'Sistema'
    };

    sessionStorage.setItem('accounts-receivable-report-print-data', JSON.stringify(reportData));
    window.open('/report/accounts-receivable-print', '_blank');
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

  trackById(_: number, item: Cuenta): number {
    return item.ventaId;
  }
}