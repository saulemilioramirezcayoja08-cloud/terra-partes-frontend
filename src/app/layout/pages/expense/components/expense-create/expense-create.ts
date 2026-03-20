import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {UserService} from '../../../../../shared/services/api/user-service';
import {PaymentMethodService} from '../../../../../shared/services/api/payment-method-service';
import {CurrencyService} from '../../../../../shared/services/static/currency-service';
import {ExpenseService} from '../../services/expense-service';
import {user_list_response} from '../../../../../shared/models/api/response/user-list-response.model';
import {payment_method_list_response} from '../../../../../shared/models/api/response/payment-method-list-response.model';
import {static_option} from '../../../../../shared/models/common/static-option.model';
import {expense_concept_list_response} from '../../../../../shared/models/api/response/expense-concept-list-response.model';
import {isPlatformBrowser} from '@angular/common';
import {ExpenseConceptService} from '../../../../../shared/services/api/expense-concept-service';
import {Router} from '@angular/router';
import {ContextFormService} from '../../../../../shared/services/context-form-service';
import {expense_context_form} from '../../../../../shared/models/context/expense-context-form.model';
import {expense_create_response} from '../../models/response/expense-create-response.model';

@Component({
  selector: 'app-expense-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './expense-create.html',
  styleUrl: './expense-create.css',
})
export class ExpenseCreate implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private user_service = inject(UserService);
  private payment_method_service = inject(PaymentMethodService);
  private currency_service = inject(CurrencyService);
  private expense_concept_service = inject(ExpenseConceptService);
  private expense_service = inject(ExpenseService);

  // contexto
  private readonly context = 'expense';

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);
  protected currencies = signal<static_option[]>([]);
  protected concepts = signal<expense_concept_list_response[]>([]);

  // items del egreso
  protected items = signal<expense_context_form['items']>([]);

  // ultimo egreso creado
  protected last_expense = signal<expense_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected selected_payment_method = signal<number | null>(null);
  protected selected_currency = signal<string>('BOB');
  protected selected_date = signal<string>('');
  protected notes = signal<string>('');
  protected loading = signal<boolean>(false);

  // campos para agregar item
  protected selected_concept = signal<number | null>(null);
  protected item_amount = signal<number>(0);
  protected item_notes = signal<string>('');

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);
  protected open_currency_dropdown = signal<boolean>(false);
  protected open_concept_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Egresos' },
    { label: 'Crear', active: true }
  ]);

  // computados
  protected has_last_expense = computed(() => this.last_expense() !== null);

  protected total = computed(() =>
    this.items().reduce((sum, item) => sum + item.amount, 0)
  );

  protected items_count = computed(() => this.items().length);

  protected is_valid_form = computed(() =>
    this.selected_user() !== null &&
    this.selected_payment_method() !== null &&
    this.selected_currency() !== '' &&
    this.selected_date() !== '' &&
    this.items().length > 0
  );

  protected can_add_item = computed(() =>
    this.selected_concept() !== null && this.item_amount() > 0
  );

  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Seleccionar usuario...';
    return this.users().find(u => u.id === id)?.name ?? 'Seleccionar usuario...';
  });

  protected selected_payment_method_name = computed(() => {
    const id = this.selected_payment_method();
    if (!id) return 'Seleccionar método...';
    return this.payment_methods().find(p => p.id === id)?.name ?? 'Seleccionar método...';
  });

  protected selected_currency_name = computed(() => {
    const code = this.selected_currency();
    if (!code) return 'Seleccionar moneda...';
    return code;
  });

  protected selected_concept_name = computed(() => {
    const id = this.selected_concept();
    if (!id) return 'Seleccionar concepto...';
    return this.concepts().find(c => c.id === id)?.name ?? 'Seleccionar concepto...';
  });

  @HostListener('document:click', ['$event'])
  on_document_click(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.close_all_dropdowns();
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
    this.load_payment_methods();
    this.load_currencies();
    this.load_concepts();
  }

  // carga todos los usuarios
  private load_users(): void {
    this.user_service.get_users().subscribe({
      next: (response) => this.users.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga metodos de pago
  private load_payment_methods(): void {
    this.payment_method_service.get_payment_methods().subscribe({
      next: (response) => this.payment_methods.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga monedas estaticas
  private load_currencies(): void {
    this.currencies.set(this.currency_service.get_currencies());
  }

  // carga conceptos de egreso
  private load_concepts(): void {
    this.expense_concept_service.get_expense_concepts().subscribe({
      next: (response) => this.concepts.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_expense_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.selected_payment_method.set(data.form.payment_method_id);
    this.selected_currency.set(data.form.currency);
    this.selected_date.set(data.form.date || this.get_today());
    this.notes.set(data.form.notes);
    this.items.set([...data.items]);
    this.last_expense.set(data.last_expense);
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_expense_form(this.context, {
      user_id: this.selected_user(),
      payment_method_id: this.selected_payment_method(),
      currency: this.selected_currency(),
      date: this.selected_date(),
      notes: this.notes()
    });
  }

  // obtiene fecha actual
  private get_today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_user_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
    this.open_currency_dropdown.set(false);
    this.open_concept_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_user_dropdown(): void {
    const current = this.open_user_dropdown();
    this.close_all_dropdowns();
    this.open_user_dropdown.set(!current);
  }

  protected toggle_payment_method_dropdown(): void {
    const current = this.open_payment_method_dropdown();
    this.close_all_dropdowns();
    this.open_payment_method_dropdown.set(!current);
  }

  protected toggle_currency_dropdown(): void {
    const current = this.open_currency_dropdown();
    this.close_all_dropdowns();
    this.open_currency_dropdown.set(!current);
  }

  protected toggle_concept_dropdown(): void {
    const current = this.open_concept_dropdown();
    this.close_all_dropdowns();
    this.open_concept_dropdown.set(!current);
  }

  // seleccion de dropdowns
  protected on_user_select(user_id: number): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_payment_method_select(payment_method_id: number): void {
    this.selected_payment_method.set(payment_method_id);
    this.open_payment_method_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_currency_select(currency_code: string): void {
    this.selected_currency.set(currency_code);
    this.open_currency_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_concept_select(concept_id: number): void {
    this.selected_concept.set(concept_id);
    this.open_concept_dropdown.set(false);
  }

  // agrega item a la lista
  protected add_item(): void {
    if (!this.can_add_item()) return;

    const concept = this.concepts().find(c => c.id === this.selected_concept());
    if (!concept) return;

    const new_item: expense_context_form['items'][0] = {
      concept: {
        id: concept.id,
        name: concept.name,
        description: concept.description
      },
      amount: this.item_amount(),
      notes: this.item_notes() || null
    };

    this.context_form_service.add_expense_item(this.context, new_item);
    this.items.set(this.context_form_service.get_expense_items(this.context));

    // limpia campos del item
    this.selected_concept.set(null);
    this.item_amount.set(0);
    this.item_notes.set('');
  }

  // actualiza item existente
  protected update_amount(index: number, amount: number): void {
    const new_amount = Math.max(0, amount);
    this.context_form_service.update_expense_item(this.context, index, { amount: new_amount });
    this.items.set(this.context_form_service.get_expense_items(this.context));
  }

  protected update_notes(index: number, notes: string): void {
    this.context_form_service.update_expense_item(this.context, index, { notes: notes || null });
    this.items.set(this.context_form_service.get_expense_items(this.context));
  }

  // elimina item
  protected remove_item(index: number): void {
    this.context_form_service.remove_expense_item(this.context, index);
    this.items.set(this.context_form_service.get_expense_items(this.context));
  }

  // acciones
  protected on_cancel(): void {
    this.context_form_service.clear_expense(this.context);
    this.load_form_from_service();
  }

  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = {
      user_id: this.selected_user()!,
      payment_method_id: this.selected_payment_method()!,
      currency: this.selected_currency(),
      date: this.selected_date(),
      notes: this.notes(),
      items: this.items().map(item => ({
        concept_id: item.concept.id,
        amount: item.amount,
        notes: item.notes
      }))
    };

    this.expense_service.create(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_expense(this.context, response);
        this.last_expense.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_expense
        this.context_form_service.update_expense_form(this.context, {
          user_id: null,
          payment_method_id: null,
          currency: 'BOB',
          date: '',
          notes: ''
        });
        this.context_form_service.clear_expense_items(this.context);
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
    this.router.navigate(['/layout/expenses/preview']);
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}
