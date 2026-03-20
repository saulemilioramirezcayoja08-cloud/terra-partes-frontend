import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { UserService } from '../../../../../shared/services/api/user-service';
import { CurrencyService } from '../../../../../shared/services/static/currency-service';
import { PaymentMethodService } from '../../../../../shared/services/api/payment-method-service';
import { PurchaseTypeService } from '../../../../../shared/services/static/purchase-type-service';
import { PurchaseService } from '../../services/purchase-service';
import { user_list_response } from '../../../../../shared/models/api/response/user-list-response.model';
import { static_option } from '../../../../../shared/models/common/static-option.model';
import { payment_method_list_response } from '../../../../../shared/models/api/response/payment-method-list-response.model';
import { purchase_context_form } from '../../../../../shared/models/context/purchase-context-form.model';
import { purchase_create_response } from '../../models/response/purchase-create-response.model';
import { isPlatformBrowser } from '@angular/common';
import { SupplierService } from '../../../../../shared/services/api/supplier-service';
import { supplier_list_response } from '../../../../../shared/models/api/response/supplier-list-response.model';

@Component({
  selector: 'app-purchase-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './purchase-create.html',
  styleUrl: './purchase-create.css',
})
export class PurchaseCreate implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private user_service = inject(UserService);
  private supplier_service = inject(SupplierService);
  private currency_service = inject(CurrencyService);
  private payment_method_service = inject(PaymentMethodService);
  private purchase_type_service = inject(PurchaseTypeService);
  private purchase_service = inject(PurchaseService);

  // contexto
  private readonly context = 'purchase';

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected suppliers = signal<supplier_list_response[]>([]);
  protected currencies = signal<static_option[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);
  protected purchase_types = signal<static_option[]>([]);

  // items de la compra
  protected items = signal<purchase_context_form['items']>([]);

  // ultima compra creada
  protected last_purchase = signal<purchase_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected selected_supplier = signal<number | null>(null);
  protected selected_currency = signal<string>('BOB');
  protected selected_payment_method = signal<number | null>(null);
  protected selected_type = signal<string>('LOCAL');
  protected payment_amount = signal<number>(0);
  protected notes = signal<string>('');
  protected loading = signal<boolean>(false);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_supplier_dropdown = signal<boolean>(false);
  protected open_currency_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);
  protected open_type_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Compras' },
    { label: 'Crear', active: true }
  ]);

  // computados
  protected has_last_purchase = computed(() => this.last_purchase() !== null);

  protected total = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.detail.quantity * item.detail.price), 0);
  });

  protected items_count = computed(() => this.items().length);

  protected is_valid_form = computed(() => {
    return this.selected_user() !== null &&
      this.selected_supplier() !== null &&
      this.selected_currency() !== '' &&
      this.selected_payment_method() !== null &&
      this.selected_type() !== '' &&
      this.items().length > 0 &&
      this.items().every(item => item.detail.quantity > 0 && item.detail.price > 0);
  });

  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Seleccionar usuario...';
    return this.users().find(u => u.id === id)?.name ?? 'Seleccionar usuario...';
  });

  protected selected_supplier_name = computed(() => {
    const id = this.selected_supplier();
    if (!id) return 'Seleccionar proveedor...';
    return this.suppliers().find(s => s.id === id)?.name ?? 'Seleccionar proveedor...';
  });

  protected selected_currency_name = computed(() => {
    const code = this.selected_currency();
    if (!code) return 'Seleccionar moneda...';
    return code;
  });

  protected selected_payment_method_name = computed(() => {
    const id = this.selected_payment_method();
    if (!id) return 'Seleccionar método...';
    return this.payment_methods().find(p => p.id === id)?.name ?? 'Seleccionar método...';
  });

  protected selected_type_name = computed(() => {
    const code = this.selected_type();
    if (!code) return 'Seleccionar tipo...';
    return this.purchase_types().find(t => t.code === code)?.label ?? 'Seleccionar tipo...';
  });

  @HostListener('document:click', ['$event'])
  on_document_click(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.close_all_dropdowns();
    }
  }

  @HostListener('document:keydown', ['$event'])
  on_keydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      this.save_form_to_service();
      this.router.navigate(['/layout/purchases/products']);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_catalogs();
      this.load_form_from_service();
    }
  }

  // carga todos los catalogos
  private load_catalogs(): void {
    this.load_users();
    this.load_suppliers();
    this.load_currencies();
    this.load_payment_methods();
    this.load_purchase_types();
  }

  // carga todos los usuarios
  private load_users(): void {
    this.user_service.get_users().subscribe({
      next: (response) => this.users.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga proveedores
  private load_suppliers(): void {
    this.supplier_service.get_suppliers().subscribe({
      next: (response) => this.suppliers.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga monedas estaticas
  private load_currencies(): void {
    this.currencies.set(this.currency_service.get_currencies());
  }

  // carga metodos de pago
  private load_payment_methods(): void {
    this.payment_method_service.get_payment_methods().subscribe({
      next: (response) => this.payment_methods.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga tipos de compra
  private load_purchase_types(): void {
    this.purchase_types.set(this.purchase_type_service.get_types());
  }

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_purchase_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.selected_supplier.set(data.form.supplier_id);
    this.selected_currency.set(data.form.currency);
    this.selected_type.set(data.form.type);
    this.selected_payment_method.set(data.payment?.method_id ?? null);
    this.payment_amount.set(data.payment?.amount ?? 0);
    this.notes.set(data.form.notes);
    this.items.set([...data.items]);
    this.last_purchase.set(data.last_purchase);
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_purchase_form(this.context, {
      user_id: this.selected_user(),
      supplier_id: this.selected_supplier(),
      warehouse_id: 1,
      currency: this.selected_currency(),
      type: this.selected_type(),
      notes: this.notes()
    });

    const method_id = this.selected_payment_method();
    const amount = this.payment_amount();
    this.context_form_service.update_purchase_payment(
      this.context,
      method_id ? { method_id, amount } : null
    );
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_user_dropdown.set(false);
    this.open_supplier_dropdown.set(false);
    this.open_currency_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
    this.open_type_dropdown.set(false);
  }

  // toggle dropdowns
  protected toggle_user_dropdown(): void {
    const current = this.open_user_dropdown();
    this.close_all_dropdowns();
    this.open_user_dropdown.set(!current);
  }

  protected toggle_supplier_dropdown(): void {
    const current = this.open_supplier_dropdown();
    this.close_all_dropdowns();
    this.open_supplier_dropdown.set(!current);
  }

  protected toggle_currency_dropdown(): void {
    const current = this.open_currency_dropdown();
    this.close_all_dropdowns();
    this.open_currency_dropdown.set(!current);
  }

  protected toggle_payment_method_dropdown(): void {
    const current = this.open_payment_method_dropdown();
    this.close_all_dropdowns();
    this.open_payment_method_dropdown.set(!current);
  }

  protected toggle_type_dropdown(): void {
    const current = this.open_type_dropdown();
    this.close_all_dropdowns();
    this.open_type_dropdown.set(!current);
  }

  // seleccion de campos
  protected on_user_select(id: number): void {
    this.selected_user.set(id);
    this.open_user_dropdown.set(false);
  }

  protected on_supplier_select(id: number): void {
    this.selected_supplier.set(id);
    this.open_supplier_dropdown.set(false);
  }

  protected on_currency_select(code: string): void {
    this.selected_currency.set(code);
    this.open_currency_dropdown.set(false);
  }

  protected on_payment_method_select(id: number): void {
    this.selected_payment_method.set(id);
    this.open_payment_method_dropdown.set(false);
  }

  protected on_type_select(code: string): void {
    this.selected_type.set(code);
    this.open_type_dropdown.set(false);
  }

  // edicion de items
  protected update_quantity(index: number, quantity: number): void {
    const item = this.items()[index];
    const new_quantity = Math.max(1, quantity);
    this.context_form_service.update_purchase_item(this.context, item.product.id, { quantity: new_quantity });
    this.items.set(this.context_form_service.get_purchase_items(this.context));
  }

  protected update_price(index: number, price: number): void {
    const item = this.items()[index];
    const new_price = Math.max(0, price);
    this.context_form_service.update_purchase_item(this.context, item.product.id, { price: new_price });
    this.items.set(this.context_form_service.get_purchase_items(this.context));
  }

  protected update_notes(index: number, notes: string): void {
    const item = this.items()[index];
    this.context_form_service.update_purchase_item(this.context, item.product.id, { notes: notes || null });
    this.items.set(this.context_form_service.get_purchase_items(this.context));
  }

  protected remove_item(index: number): void {
    const item = this.items()[index];
    this.context_form_service.remove_purchase_item(this.context, item.product.id);
    this.items.set(this.context_form_service.get_purchase_items(this.context));
  }

  // acciones
  protected on_cancel(): void {
    this.context_form_service.clear_purchase(this.context);
    this.load_form_from_service();
  }

  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = this.context_form_service.build_purchase_request(this.context);

    this.purchase_service.create_purchase(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_purchase(this.context, response);
        this.last_purchase.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_purchase
        this.context_form_service.update_purchase_form(this.context, {
          user_id: null,
          supplier_id: null,
          warehouse_id: 1,
          currency: 'BOB',
          type: 'LOCAL',
          notes: ''
        });
        this.context_form_service.update_purchase_payment(this.context, null);
        this.context_form_service.clear_purchase_items(this.context);
        this.load_form_from_service();
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.loading.set(false);
      }
    });
  }

  // navega a vista previa
  protected on_preview(): void {
    this.router.navigate(['/layout/purchases/preview']);
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected calculate_subtotal(item: purchase_context_form['items'][0]): number {
    return item.detail.quantity * item.detail.price;
  }
}
