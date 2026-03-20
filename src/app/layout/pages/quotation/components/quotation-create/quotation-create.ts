import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { UserService } from '../../../../../shared/services/api/user-service';
import { CustomerService } from '../../../../../shared/services/api/customer-service';
import { CurrencyService } from '../../../../../shared/services/static/currency-service';
import { QuotationService } from '../../services/quotation-service';
import { user_list_response } from '../../../../../shared/models/api/response/user-list-response.model';
import { static_option } from '../../../../../shared/models/common/static-option.model';
import { customer_list_response } from '../../../../../shared/models/api/response/customer-list-response.model';
import { quotation_context_form } from '../../../../../shared/models/context/quotation-context-form.model';
import { quotation_create_response } from '../../models/response/quotation-create-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-quotation-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './quotation-create.html',
  styleUrl: './quotation-create.css',
})
export class QuotationCreate implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private user_service = inject(UserService);
  private customer_service = inject(CustomerService);
  private currency_service = inject(CurrencyService);
  private quotation_service = inject(QuotationService);

  // contexto
  private readonly context = 'quotation';

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected customers = signal<customer_list_response[]>([]);
  protected currencies = signal<static_option[]>([]);

  // items de la cotizacion
  protected items = signal<quotation_context_form['items']>([]);

  // ultima cotizacion creada
  protected last_quotation = signal<quotation_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected selected_customer = signal<number | null>(null);
  protected selected_currency = signal<string>('BOB');
  protected notes = signal<string>('');
  protected loading = signal<boolean>(false);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_customer_dropdown = signal<boolean>(false);
  protected open_currency_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Cotizaciones' },
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
      this.items().length > 0 &&
      this.items().every(item => item.detail.quantity > 0 && item.detail.price > 0);
  });

  protected has_last_quotation = computed(() => this.last_quotation() !== null);

  // habilita preview de borrador si hay items en el formulario actual
  protected can_preview_draft = computed(() => this.items().length > 0);

  // habilita preview de ultima cotizacion guardada
  protected can_preview_last = computed(() => this.has_last_quotation());

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
      this.router.navigate(['/layout/quotations/products']);
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

  // carga monedas
  private load_currencies(): void {
    this.currencies.set(this.currency_service.get_currencies());
  }

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_quotation_form_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.selected_customer.set(data.form.customer_id);
    this.selected_currency.set(data.form.currency);
    this.notes.set(data.form.notes);
    this.items.set([...data.items]);
    this.last_quotation.set(data.last_quotation);
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_quotation_form(this.context, {
      user_id: this.selected_user(),
      customer_id: this.selected_customer(),
      warehouse_id: 1,
      currency: this.selected_currency(),
      notes: this.notes()
    });
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_user_dropdown.set(false);
    this.open_customer_dropdown.set(false);
    this.open_currency_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_user_dropdown(): void {
    this.open_user_dropdown.update(v => !v);
    this.open_customer_dropdown.set(false);
    this.open_currency_dropdown.set(false);
  }

  protected toggle_customer_dropdown(): void {
    this.open_customer_dropdown.update(v => !v);
    this.open_user_dropdown.set(false);
    this.open_currency_dropdown.set(false);
  }

  protected toggle_currency_dropdown(): void {
    this.open_currency_dropdown.update(v => !v);
    this.open_user_dropdown.set(false);
    this.open_customer_dropdown.set(false);
  }

  // selecciones
  protected on_user_select(user_id: number): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_customer_select(customer_id: number): void {
    this.selected_customer.set(customer_id);
    this.open_customer_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_currency_select(currency_code: string): void {
    this.selected_currency.set(currency_code);
    this.open_currency_dropdown.set(false);
    this.save_form_to_service();
  }

  // actualizacion de items
  protected update_quantity(index: number, quantity: number): void {
    const item = this.items()[index];
    this.context_form_service.update_quotation_item(this.context, item.product.id, { quantity });
    this.items.set(this.context_form_service.get_quotation_items(this.context));
  }

  protected update_price(index: number, price: number): void {
    const item = this.items()[index];
    this.context_form_service.update_quotation_item(this.context, item.product.id, { price });
    this.items.set(this.context_form_service.get_quotation_items(this.context));
  }

  protected update_notes(index: number, notes: string): void {
    const item = this.items()[index];
    this.context_form_service.update_quotation_item(this.context, item.product.id, { notes: notes || null });
    this.items.set(this.context_form_service.get_quotation_items(this.context));
  }

  protected remove_item(index: number): void {
    const item = this.items()[index];
    this.context_form_service.remove_quotation_item(this.context, item.product.id);
    this.items.set(this.context_form_service.get_quotation_items(this.context));
  }

  // acciones
  protected on_cancel(): void {
    this.context_form_service.clear_quotation(this.context);
    this.load_form_from_service();
  }

  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = this.context_form_service.build_quotation_request(this.context);

    this.quotation_service.create_quotation(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_quotation(this.context, response);
        this.last_quotation.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_quotation
        this.context_form_service.update_quotation_form(this.context, {
          user_id: null,
          customer_id: null,
          warehouse_id: 1,
          currency: 'BOB',
          notes: ''
        });
        this.context_form_service.clear_quotation_items(this.context);
        this.load_form_from_service();
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.loading.set(false);
      }
    });
  }

  // navega al preview mostrando el borrador actual (limpia last_quotation para forzar caso draft)
  protected on_preview_draft(): void {
    this.save_form_to_service();
    this.context_form_service.set_last_quotation(this.context, null);
    this.last_quotation.set(null);
    this.router.navigate(['/layout/quotations/preview']);
  }

  // navega al preview mostrando la ultima cotizacion guardada
  protected on_preview_last(): void {
    this.router.navigate(['/layout/quotations/preview']);
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected calculate_subtotal(item: quotation_context_form['items'][0]): number {
    return item.detail.quantity * item.detail.price;
  }
}
