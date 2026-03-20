import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { PurchaseService } from '../../services/purchase-service';
import { purchase_detail_response } from '../../models/response/purchase-detail-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-purchase-preview',
  imports: [Breadcrumb],
  templateUrl: './purchase-preview.html',
  styleUrl: './purchase-preview.css',
})
export class PurchasePreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private purchase_service = inject(PurchaseService);

  // contexto
  private readonly context = 'purchase';

  // estado
  protected purchase = signal<purchase_detail_response | null>(null);
  protected loading = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Compras' },
    { label: 'Vista Previa', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);
  protected has_id = computed(() => !!this.route.snapshot.paramMap.get('id'));

  protected purchase_id = computed(() => this.purchase()?.purchase.id ?? null);

  protected is_pending = computed(() => this.purchase()?.purchase.status === 'PENDING');

  protected can_add_payment = computed(() => {
    const status = this.purchase()?.purchase.status ?? '';
    return status === 'PENDING' || status === 'COMPLETED';
  });

  protected status_class = computed(() => {
    const status = this.purchase()?.purchase.status?.toLowerCase();
    return status ?? 'pending';
  });

  protected total_quantity = computed(() =>
    this.purchase()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  protected status_label = computed(() => {
    const status = this.purchase()?.purchase.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected type_label = computed(() => {
    const type = this.purchase()?.purchase.type;
    const labels: Record<string, string> = {
      'LOCAL': 'Local',
      'IMPORT': 'Importación'
    };
    return labels[type ?? ''] ?? type ?? '';
  });

  protected total_literal = computed(() => {
    const total = this.purchase()?.totals.total ?? 0;
    return this.number_to_literal(total);
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_purchase();
    }
  }

  // carga compra desde api o desde servicio
  private load_purchase(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load_from_api(Number(id));
    } else {
      this.load_from_service();
    }
  }

  // carga compra desde api
  private load_from_api(id: number): void {
    this.loading.set(true);
    this.error_message.set(null);

    this.purchase_service.get_purchase(id).subscribe({
      next: (response) => {
        this.purchase.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al cargar la compra');
        this.loading.set(false);
      }
    });
  }

  // carga compra desde servicio y mapea a purchase_detail_response
  private load_from_service(): void {
    const last_purchase = this.context_form_service.get_last_purchase(this.context);
    if (last_purchase) {
      const mapped: purchase_detail_response = {
        purchase: last_purchase.purchase,
        user: last_purchase.user,
        supplier: last_purchase.supplier,
        warehouse: last_purchase.warehouse,
        payment_method: last_purchase.payment_method,
        items: last_purchase.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_sku: item.product_sku,
          product_name: item.product_name,
          product_origin: item.product_origin,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          notes: item.notes
        })),
        payments: last_purchase.payment
          ? [{ id: last_purchase.payment.id, amount: last_purchase.payment.amount, user_name: null, created_at: last_purchase.purchase.created_at }]
          : [],
        totals: last_purchase.totals
      };
      this.purchase.set(mapped);
    } else {
      this.router.navigate(['/layout/purchases/create']);
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
      this.router.navigate(['/layout/purchases/list']);
    }
  }

  // navega a pagos reemplazando historial para evitar doble back
  protected go_to_payments(): void {
    const id = this.purchase_id();
    if (id) {
      this.router.navigate(['/layout/purchases', id, 'payments'], { replaceUrl: true });
    }
  }

  // navega a completar compra reemplazando historial para evitar doble back
  protected go_to_complete(): void {
    const id = this.purchase_id();
    if (id) {
      this.router.navigate(['/layout/purchases', id, 'complete'], { replaceUrl: true });
    }
  }

  // abre ventana de impresion en nueva pestana
  protected print_purchase(): void {
    const id = this.purchase_id();
    if (id) {
      window.open(`/print/purchases/${id}`, '_blank');
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