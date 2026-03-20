import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { QuotationService } from '../../services/quotation-service';
import { quotation_detail_response } from '../../models/response/quotation-detail-response.model';
import { isPlatformBrowser } from '@angular/common';

// modelo interno de campos editables
interface editable_fields {
  quotation: {
    number: string;
    date: string;
  };
  customer: {
    name: string;
  };
  user: {
    name: string;
  };
  warehouse: {
    name: string;
  };
  items: {
    product_sku: string;
    product_name: string;
    product_origin: string;
  }[];
}

@Component({
  selector: 'app-quotation-preview',
  imports: [Breadcrumb],
  templateUrl: './quotation-preview.html',
  styleUrl: './quotation-preview.css',
})
export class QuotationPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private quotation_service = inject(QuotationService);

  // contexto
  private readonly context = 'quotation';

  // estado
  protected quotation = signal<quotation_detail_response | null>(null);
  protected loading = signal<boolean>(false);
  protected error_message = signal<string | null>(null);
  protected is_draft = signal<boolean>(false);

  // campos editables en memoria
  protected editable = signal<editable_fields | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Cotizaciones' },
    { label: 'Vista Previa', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  protected quotation_id = computed(() => this.quotation()?.quotation.id ?? null);

  protected has_id = computed(() => {
    return this.route.snapshot.paramMap.get('id') !== null;
  });

  protected status_class = computed(() => {
    const status = this.quotation()?.quotation.status?.toLowerCase();
    return status ?? 'pending';
  });

  protected total_quantity = computed(() =>
    this.quotation()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  protected status_label = computed(() => {
    const status = this.quotation()?.quotation.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado',
      'DRAFT': 'Borrador'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected total_literal = computed(() => {
    const total = this.quotation()?.totals.total ?? 0;
    return this.number_to_literal(total);
  });

  // retorna los campos editables con fallback seguro
  protected editable_safe = computed(() => this.editable() ?? {
    quotation: { number: '—', date: '—' },
    customer: { name: '—' },
    user: { name: '—' },
    warehouse: { name: '—' },
    items: []
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_quotation();
    }
  }

  // inicializa los campos editables desde la cotizacion cargada
  private init_editable(data: quotation_detail_response): void {
    this.editable.set({
      quotation: {
        number: data.quotation.number,
        date: this.format_date(data.quotation.created_at)
      },
      customer: { name: data.customer.name },
      user: { name: data.user.name },
      warehouse: { name: data.warehouse.name },
      items: data.items.map(item => ({
        product_sku: item.product_sku,
        product_name: item.product_name,
        product_origin: item.product_origin
      }))
    });
  }

  // retorna el item editable por indice con fallback seguro
  protected get_editable_item(index: number) {
    return this.editable()?.items[index] ?? { product_sku: '', product_name: '', product_origin: '' };
  }

  // actualiza el numero de cotizacion
  protected update_number(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, quotation: { ...current.quotation, number: value || '—' } });
  }

  // actualiza la fecha mostrada
  protected update_date(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, quotation: { ...current.quotation, date: value || '—' } });
  }

  // actualiza el nombre del cliente
  protected update_customer_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, customer: { name: value || '—' } });
  }

  // actualiza el nombre del usuario
  protected update_user_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, user: { name: value || '—' } });
  }

  // actualiza el nombre del almacen
  protected update_warehouse_name(event: Event): void {
    const value = (event.target as HTMLElement).innerText.trim();
    const current = this.editable();
    if (current) this.editable.set({ ...current, warehouse: { name: value || '—' } });
  }

  // actualiza un campo de un item por indice
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
  protected print_quotation(): void {
    const id = this.quotation_id();
    if (id) {
      window.open(`/print/quotations/${id}`, '_blank');
    }
  }

  // determina la fuente de datos segun la ruta
  private load_quotation(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load_from_api(Number(id));
    } else {
      this.load_from_service();
    }
  }

  // carga cotizacion desde api
  private load_from_api(id: number): void {
    this.loading.set(true);
    this.error_message.set(null);

    this.quotation_service.get_quotation(id).subscribe({
      next: (response) => {
        this.quotation.set(response);
        this.init_editable(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al cargar la cotización');
        this.loading.set(false);
      }
    });
  }

  // carga cotizacion desde servicio: ultima guardada o borrador en memoria
  private load_from_service(): void {
    const last_quotation = this.context_form_service.get_last_quotation(this.context);

    if (last_quotation) {
      const mapped: quotation_detail_response = {
        quotation: last_quotation.quotation,
        user: last_quotation.user,
        customer: last_quotation.customer,
        warehouse: last_quotation.warehouse,
        items: last_quotation.items.map(item => ({
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
        totals: last_quotation.totals
      };
      this.quotation.set(mapped);
      this.init_editable(mapped);
      return;
    }

    // intenta construir borrador desde el contexto en memoria
    const draft_data = this.context_form_service.get_quotation_form_data(this.context);

    if (draft_data.items.length > 0) {
      this.load_draft(draft_data);
      return;
    }

    // no hay nada que mostrar
    this.router.navigate(['/layout/quotations/create']);
  }

  // construye un objeto borrador desde el contexto en memoria
  private load_draft(data: ReturnType<ContextFormService['get_quotation_form_data']>): void {
    this.is_draft.set(true);

    const total = data.items.reduce(
      (sum, item) => sum + item.detail.quantity * item.detail.price,
      0
    );

    const draft: quotation_detail_response = {
      quotation: {
        id: 0,
        number: '—',
        status: 'DRAFT',
        currency: data.form.currency,
        notes: data.form.notes ?? null,
        created_at: new Date().toISOString()
      },
      user: { id: 0, name: '—' },
      customer: { id: 0, name: '—' },
      warehouse: { id: 0, name: '—' },
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
      totals: { total }
    };

    this.quotation.set(draft);
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
      this.router.navigate(['/layout/quotations/list']);
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