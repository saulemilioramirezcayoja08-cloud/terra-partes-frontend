import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../layout/pages/order/services/order-service';
import { order_detail_response } from '../../../layout/pages/order/models/response/order-detail-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-order-print',
  imports: [],
  templateUrl: './order-print.html',
  styleUrl: './order-print.css',
})
export class OrderPrint implements OnInit {
  // dependencias
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private order_service = inject(OrderService);

  // estado
  protected order = signal<order_detail_response | null>(null);
  protected loading = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  protected status_label = computed(() => {
    const status = this.order()?.order.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected total_quantity = computed(() =>
    this.order()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  protected total_literal = computed(() => {
    const total = this.order()?.totals.total ?? 0;
    return this.number_to_literal(total);
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_order();
    }
  }

  // carga orden desde api por id de ruta
  private load_order(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/layout/orders/list']);
      return;
    }

    this.loading.set(true);
    this.error_message.set(null);

    this.order_service.get_order(id).subscribe({
      next: (response) => {
        this.order.set(response);
        this.loading.set(false);
        // espera que el DOM renderice, registra cierre automatico y abre dialogo de impresion
        setTimeout(() => {
          window.addEventListener('afterprint', () => window.close(), { once: true });
          window.print();
        }, 300);
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al cargar la orden');
        this.loading.set(false);
      }
    });
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

  // formateo de numeros
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  // formateo de fecha corta
  protected format_date(date: string): string {
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // formateo de fecha y hora
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