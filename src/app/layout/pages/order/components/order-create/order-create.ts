import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../../shared/services/api/user-service';
import { CustomerService } from '../../../../../shared/services/api/customer-service';
import { CurrencyService } from '../../../../../shared/services/static/currency-service';
import { PaymentMethodService } from '../../../../../shared/services/api/payment-method-service';
import { OrderService } from '../../services/order-service';
import { isPlatformBrowser } from '@angular/common';
import { payment_method_list_response } from '../../../../../shared/models/api/response/payment-method-list-response.model';
import { user_list_response } from '../../../../../shared/models/api/response/user-list-response.model';
import { customer_list_response } from '../../../../../shared/models/api/response/customer-list-response.model';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { static_option } from '../../../../../shared/models/common/static-option.model';
import { order_create_response } from '../../models/response/order-create-response.model';
import { order_context_form } from '../../../../../shared/models/context/order-context-form.model';

@Component({
  selector: 'app-order-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css',
})
export class OrderCreate implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private user_service = inject(UserService);
  private customer_service = inject(CustomerService);
  private currency_service = inject(CurrencyService);
  private payment_method_service = inject(PaymentMethodService);
  private order_service = inject(OrderService);

  // contexto
  private readonly context = 'order';

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected customers = signal<customer_list_response[]>([]);
  protected currencies = signal<static_option[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);

  // items de la orden
  protected items = signal<order_context_form['items']>([]);

  // ultima orden creada
  protected last_order = signal<order_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected selected_customer = signal<number | null>(null);
  protected selected_currency = signal<string>('BOB');
  protected selected_payment_method = signal<number | null>(null);
  protected payment_amount = signal<number>(0);
  protected notes = signal<string>('');
  protected loading = signal<boolean>(false);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_customer_dropdown = signal<boolean>(false);
  protected open_currency_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Órdenes' },
    { label: 'Crear', active: true }
  ]);

  // computados
  protected total = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.detail.quantity * item.detail.price), 0);
  });

  protected items_count = computed(() => this.items().length);

  protected is_valid_form = computed(() => {
    return this.selected_user() !== null &&
      this.selected_customer() !== null &&
      this.selected_currency() !== '' &&
      this.selected_payment_method() !== null &&
      this.items().length > 0 &&
      this.items().every(item => item.detail.quantity > 0 && item.detail.price > 0);
  });

  protected has_last_order = computed(() => this.last_order() !== null);
  protected can_preview_draft = computed(() => this.items().length > 0);
  protected can_preview_last = computed(() => this.has_last_order());

  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Seleccionar usuario...';
    return this.users().find(u => u.id === id)?.name ?? 'Seleccionar usuario...';
  });

  protected selected_customer_name = computed(() => {
    const id = this.selected_customer();
    if (!id) return 'Seleccionar cliente...';
    return this.customers().find(c => c.id === id)?.name ?? 'Seleccionar cliente...';
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
      this.router.navigate(['/layout/orders/products']);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_catalogs();
      this.load_form_from_service();
    }
  }

  // carga catalogos
  private load_catalogs(): void {
    this.load_users();
    this.load_customers();
    this.load_currencies();
    this.load_payment_methods();
  }

  // carga todos los usuarios
  private load_users(): void {
    this.user_service.get_users().subscribe({
      next: (response) => this.users.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga clientes
  private load_customers(): void {
    this.customer_service.get_customers().subscribe({
      next: (response) => this.customers.set(response),
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

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_form_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.selected_customer.set(data.form.customer_id);
    this.selected_currency.set(data.form.currency);
    this.selected_payment_method.set(data.payment?.method_id ?? null);
    this.payment_amount.set(data.payment?.amount ?? 0);
    this.notes.set(data.form.notes);
    this.items.set([...data.items]);
    this.last_order.set(this.context_form_service.get_last_order(this.context));
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_form(this.context, {
      user_id: this.selected_user(),
      customer_id: this.selected_customer(),
      warehouse_id: 1,
      currency: this.selected_currency(),
      notes: this.notes()
    });

    const method_id = this.selected_payment_method();
    const amount = this.payment_amount();
    this.context_form_service.update_payment(
      this.context,
      method_id ? { method_id, amount } : null
    );
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_user_dropdown.set(false);
    this.open_customer_dropdown.set(false);
    this.open_currency_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
  }

  // toggle dropdowns
  protected toggle_user_dropdown(): void {
    const current = this.open_user_dropdown();
    this.close_all_dropdowns();
    this.open_user_dropdown.set(!current);
  }

  protected toggle_customer_dropdown(): void {
    const current = this.open_customer_dropdown();
    this.close_all_dropdowns();
    this.open_customer_dropdown.set(!current);
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

  // seleccion de campos
  protected on_user_select(user_id: number): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
  }

  protected on_customer_select(customer_id: number): void {
    this.selected_customer.set(customer_id);
    this.open_customer_dropdown.set(false);
  }

  protected on_currency_select(code: string): void {
    this.selected_currency.set(code);
    this.open_currency_dropdown.set(false);
  }

  protected on_payment_method_select(payment_id: number): void {
    this.selected_payment_method.set(payment_id);
    this.open_payment_method_dropdown.set(false);
  }

  // edicion de items
  protected update_quantity(index: number, quantity: number): void {
    const item = this.items()[index];
    const new_quantity = Math.max(1, quantity);
    this.context_form_service.update_item(this.context, item.product.id, { quantity: new_quantity });
    this.items.set(this.context_form_service.get_items(this.context));
  }

  protected update_price(index: number, price: number): void {
    const item = this.items()[index];
    const new_price = Math.max(0, price);
    this.context_form_service.update_item(this.context, item.product.id, { price: new_price });
    this.items.set(this.context_form_service.get_items(this.context));
  }

  protected update_notes(index: number, notes: string): void {
    const item = this.items()[index];
    this.context_form_service.update_item(this.context, item.product.id, { notes: notes || null });
    this.items.set(this.context_form_service.get_items(this.context));
  }

  protected remove_item(index: number): void {
    const item = this.items()[index];
    this.context_form_service.remove_item(this.context, item.product.id);
    this.items.set(this.context_form_service.get_items(this.context));
  }

  // acciones
  protected on_cancel(): void {
    this.context_form_service.clear(this.context);
    this.load_form_from_service();
  }

  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = this.context_form_service.build_order_request(this.context);

    this.order_service.create_order(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_order(this.context, response);
        this.last_order.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_order
        this.context_form_service.update_form(this.context, {
          user_id: null,
          customer_id: null,
          warehouse_id: 1,
          currency: 'BOB',
          notes: ''
        });
        this.context_form_service.update_payment(this.context, null);
        this.context_form_service.clear_items(this.context);
        this.load_form_from_service();
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.loading.set(false);
      }
    });
  }

  // navega al preview mostrando el borrador actual
  protected on_preview_draft(): void {
    this.save_form_to_service();
    this.context_form_service.set_last_order(this.context, null);
    this.last_order.set(null);
    this.router.navigate(['/layout/orders/preview']);
  }

  // navega al preview mostrando la ultima orden guardada
  protected on_preview_last(): void {
    this.router.navigate(['/layout/orders/preview']);
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected calculate_subtotal(item: order_context_form['items'][0]): number {
    return item.detail.quantity * item.detail.price;
  }
}
