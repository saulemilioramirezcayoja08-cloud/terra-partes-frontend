import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from '../../services/sale-service';
import { sale_detail_response } from '../../models/response/sale-detail-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sale-preview',
  imports: [Breadcrumb],
  templateUrl: './sale-preview.html',
  styleUrl: './sale-preview.css',
})
export class SalePreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private sale_service = inject(SaleService);

  // estado
  protected sale = signal<sale_detail_response | null>(null);
  protected loading = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Ventas' },
    { label: 'Vista Previa', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  protected sale_id = computed(() => this.sale()?.sale.id ?? null);

  protected is_pending = computed(() => this.sale()?.sale.status === 'PENDING');

  // permite agregar pagos si la venta esta pendiente o completada
  protected can_add_payment = computed(() => {
    const status = this.sale()?.sale.status ?? '';
    return status === 'PENDING' || status === 'COMPLETED';
  });

  protected status_class = computed(() => {
    const status = this.sale()?.sale.status?.toLowerCase();
    return status ?? 'pending';
  });

  protected total_quantity = computed(() =>
    this.sale()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  protected status_label = computed(() => {
    const status = this.sale()?.sale.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected total_literal = computed(() => {
    const total = this.sale()?.totals.total ?? 0;
    return this.number_to_literal(total);
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_sale();
    }
  }

  // carga venta desde api
  private load_sale(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/layout/sales/list']);
      return;
    }

    this.loading.set(true);
    this.error_message.set(null);

    this.sale_service.get_sale(Number(id)).subscribe({
      next: (response) => {
        this.sale.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al cargar la venta');
        this.loading.set(false);
      }
    });
  }

  // abre ventana de impresion en nueva pestana
  protected print_sale(): void {
    const id = this.sale_id();
    if (id) {
      window.open(`/print/sales/${id}`, '_blank');
    }
  }

  // convierte numero a literal en español
  private number_to_literal(amount: number): string {
    const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const integer_part = Math.floor(amount);
    const decimal_part = Math.round((amount - integer_part) * 100);

    if (integer_part === 0) {
      return `cero ${decimal_part.toString().padStart(2, '0')}/100`;
    }

    const convert_group = (n: number): string => {
      if (n === 0) return '';
      if (n === 100) return 'cien';
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 30) {
        if (n === 20) return 'veinte';
        return 'veinti' + units[n - 20];
      }
      if (n < 100) {
        const ten = Math.floor(n / 10);
        const unit = n % 10;
        return unit === 0 ? tens[ten] : `${tens[ten]} y ${units[unit]}`;
      }
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      if (remainder === 0) return n === 100 ? 'cien' : hundreds[hundred];
      return `${hundreds[hundred]} ${convert_group(remainder)}`;
    };

    const convert_thousands = (n: number): string => {
      if (n < 1000) return convert_group(n);
      if (n < 1000000) {
        const thousands = Math.floor(n / 1000);
        const remainder = n % 1000;
        const thousands_text = thousands === 1 ? 'mil' : `${convert_group(thousands)} mil`;
        return remainder === 0 ? thousands_text : `${thousands_text} ${convert_group(remainder)}`;
      }
      const millions = Math.floor(n / 1000000);
      const remainder = n % 1000000;
      const millions_text = millions === 1 ? 'un millón' : `${convert_group(millions)} millones`;
      return remainder === 0 ? millions_text : `${millions_text} ${convert_thousands(remainder)}`;
    };

    const literal = convert_thousands(integer_part);
    return `${literal} ${decimal_part.toString().padStart(2, '0')}/100`;
  }

  // vuelve atras usando historial del navegador
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/sales/list']);
    }
  }

  // navega a pagos reemplazando historial para evitar doble back
  protected go_to_payments(): void {
    const id = this.sale_id();
    if (id) {
      this.router.navigate(['/layout/sales', id, 'payments'], { replaceUrl: true });
    }
  }

  // navega a completar venta reemplazando historial para evitar doble back
  protected go_to_complete(): void {
    const id = this.sale_id();
    if (id) {
      this.router.navigate(['/layout/sales', id, 'complete'], { replaceUrl: true });
    }
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected format_date(date: string): string {
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  protected format_datetime(date: string): string {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}