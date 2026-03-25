import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { OrderService } from '../../services/order-service';
import { isPlatformBrowser } from '@angular/common';
import { order_detail_response } from '../../models/response/order-detail-response.model';
import { order_void_request } from '../../models/request/order-void.request';

interface editable_fields {
  order: {
    number: string;
    date: string;
  };
  customer: {
    name: string;
    phone: string;
  };
  user: {
    name: string;
  };
  warehouse: {
    name: string;
  };
  payment_method: {
    name: string;
  };
  items: {
    product_sku: string;
    product_name: string;
    product_origin: string;
  }[];
}

@Component({
  selector: 'app-order-preview',
  imports: [Breadcrumb],
  templateUrl: './order-preview.html',
  styleUrl: './order-preview.css',
})
export class OrderPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private order_service = inject(OrderService);

  // contexto
  private readonly context = 'order';

  // estado
  protected order = signal<order_detail_response | null>(null);
  protected loading = signal<boolean>(false);
  protected error_message = signal<string | null>(null);
  protected is_draft = signal<boolean>(false);

  // campos editables en memoria
  protected editable = signal<editable_fields | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Órdenes' },
    { label: 'Vista Previa', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);
  protected has_id = computed(() => !!this.route.snapshot.paramMap.get('id'));

  protected order_id = computed(() => this.order()?.order.id ?? null);

  protected is_pending = computed(() => this.order()?.order.status === 'PENDING');

  protected can_void = computed(() => this.is_pending() && this.has_id());

  protected status_class = computed(() => {
    const status = this.order()?.order.status?.toLowerCase();
    return status ?? 'pending';
  });

  protected total_quantity = computed(() =>
    this.order()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  protected status_label = computed(() => {
    const status = this.order()?.order.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado',
      'DRAFT': 'Borrador'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected total_literal = computed(() => {
    const total = this.order()?.totals.total ?? 0;
    return this.number_to_literal(total);
  });

  // retorna campos editables con fallback seguro
  protected editable_safe = computed(() => this.editable() ?? {
    order: { number: '—', date: '—' },
    customer: { name: '—', phone: '—' },
    user: { name: '—' },
    warehouse: { name: '—' },
    payment_method: { name: '—' },
    items: []
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_order();
    }
  }

  // inicializa campos editables desde la orden cargada
  private init_editable(data: order_detail_response): void {
    this.editable.set({
      order: {
        number: data.order.number,
        date: this.format_date(data.order.created_at)
      },
      customer: { name: data.customer.name, phone: data.customer.phone },
      user: { name: data.user.name },
      warehouse: { name: data.warehouse.name },
      payment_method: { name: data.payment_method.name },
      items: data.items.map(item => ({
        product_sku: item.product_sku,
        product_name: item.product_name,
        product_origin: item.product_origin
      }))
    });
  }

  // retorna item editable por indice con fallback seguro
  protected get_editable_item(index: number) {
    return this.editable()?.items[index] ?? { product_sku: '', product_name: '', product_origin: '' };
  }

  // actualiza numero de orden
  protected update_number(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, order: { ...current.order, number: value || '—' } });
  }

  // actualiza fecha mostrada
  protected update_date(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, order: { ...current.order, date: value || '—' } });
  }

  // actualiza nombre del cliente
  protected update_customer_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, customer: { ...current.customer, name: value || '—' } });
  }

  // actualiza telefono del cliente
  protected update_customer_phone(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, customer: { ...current.customer, phone: value || '—' } });
  }

  // actualiza nombre del usuario
  protected update_user_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, user: { name: value || '—' } });
  }

  // actualiza nombre del almacen
  protected update_warehouse_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, warehouse: { name: value || '—' } });
  }

  // actualiza nombre del metodo de pago
  protected update_payment_method_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, payment_method: { name: value || '—' } });
  }

  // actualiza campo de item por indice
  protected update_item_field(
    index: number,
    field: 'product_sku' | 'product_name' | 'product_origin',
    event: Event
  ): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (!current) return;

    const items = current.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    this.editable.set({ ...current, items });
  }

  // evita salto de linea en contenteditable con enter
  protected prevent_newline(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLElement).blur();
    }
  }

  // abre ventana de impresion en nueva pestana
  protected print_order(): void {
    const id = this.order_id();
    if (id) {
      window.open(`/print/orders/${id}`, '_blank');
    }
  }

  // anula la orden usando prompt para el motivo
  protected void_order(): void {
    const id = this.order_id();
    if (!id) return;

    const notes = prompt('Motivo de anulación (opcional):');

    // si el usuario cancela el prompt, notes es null
    if (notes === null) return;

    const request: order_void_request = {
      notes: notes.trim() || null
    };

    this.order_service.void_order(id, request).subscribe({
      next: (response) => {
        const current = this.order();
        if (current) {
          this.order.set({
            ...current,
            order: {
              ...current.order,
              status: response.order.status,
              notes: response.order.notes
            }
          });
        }
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al anular la orden');
      }
    });
  }

  // carga orden desde api o desde servicio
  private load_order(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load_from_api(Number(id));
    } else {
      this.load_from_service();
    }
  }

  // carga orden desde api
  private load_from_api(id: number): void {
    this.loading.set(true);
    this.error_message.set(null);

    this.order_service.get_order(id).subscribe({
      next: (response) => {
        this.order.set(response);
        this.init_editable(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  // carga orden desde servicio: ultima guardada o borrador en memoria
  private load_from_service(): void {
    const last_order = this.context_form_service.get_last_order(this.context);

    if (last_order) {
      const mapped: order_detail_response = {
        order: {
          ...last_order.order,
          quotation_id: null
        },
        user: last_order.user,
        customer: last_order.customer,
        warehouse: last_order.warehouse,
        payment_method: last_order.payment_method,
        items: last_order.items.map(item => ({
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
        payments: last_order.payment
          ? [{ id: last_order.payment.id, amount: last_order.payment.amount, user_name: null, created_at: last_order.order.created_at }]
          : [],
        totals: last_order.totals
      };
      this.order.set(mapped);
      this.init_editable(mapped);
      return;
    }

    // intenta construir borrador desde el contexto en memoria
    const draft_data = this.context_form_service.get_form_data(this.context);

    if (draft_data.items.length > 0) {
      this.load_draft(draft_data);
      return;
    }

    this.router.navigate(['/layout/orders/create']);
  }

  // construye un objeto borrador desde el contexto en memoria
  private load_draft(data: ReturnType<ContextFormService['get_form_data']>): void {
    this.is_draft.set(true);

    const total = data.items.reduce(
      (sum, item) => sum + item.detail.quantity * item.detail.price,
      0
    );

    const draft: order_detail_response = {
      order: {
        id: 0,
        number: '—',
        status: 'DRAFT',
        currency: data.form.currency,
        notes: data.form.notes ?? null,
        quotation_id: null,
        created_at: new Date().toISOString()
      },
      user: { id: 0, name: '—' },
      customer: { id: 0, name: '—', phone: '—' },
      warehouse: { id: 0, name: '—' },
      payment_method: { id: 0, name: '—' },
      items: data.items.map(item => ({
        id: 0,
        product_id: item.product.id,
        product_sku: item.product.sku,
        product_name: item.product.name,
        product_origin: item.product.origin,
        quantity: item.detail.quantity,
        price: item.detail.price,
        subtotal: item.detail.quantity * item.detail.price,
        notes: item.detail.notes
      })),
      payments: [],
      totals: { total, paid: 0, pending: total }
    };

    this.order.set(draft);
    this.init_editable(draft);
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
      this.router.navigate(['/layout/orders/list']);
    }
  }

  // navega a pagos reemplazando historial para evitar doble back
  protected go_to_payments(): void {
    const id = this.order_id();
    if (id) {
      this.router.navigate(['/layout/orders', id, 'payments'], { replaceUrl: true });
    }
  }

  // navega a completar orden reemplazando historial para evitar doble back
  protected go_to_complete(): void {
    const id = this.order_id();
    if (id) {
      this.router.navigate(['/layout/orders', id, 'complete'], { replaceUrl: true });
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