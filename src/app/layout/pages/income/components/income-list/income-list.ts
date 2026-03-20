import { Component, inject, OnInit, PLATFORM_ID, signal, computed, HostListener } from '@angular/core';
import { Breadcrumb } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { Paginator } from '../../../../../shared/components/paginator/paginator';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { DateRange } from '../../../../../shared/components/date-range/date-range';
import { Router } from '@angular/router';
import { IncomeService } from '../../services/income-service';
import { UserService } from '../../../../../shared/services/api/user-service';
import { PaymentMethodService } from '../../../../../shared/services/api/payment-method-service';
import { income_list_response } from '../../models/response/income-list-response.model';
import { user_list_response } from '../../../../../shared/models/api/response/user-list-response.model';
import { payment_method_list_response } from '../../../../../shared/models/api/response/payment-method-list-response.model';
import { breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-income-list',
  imports: [Breadcrumb, Paginator, DateRange, DatePipe],
  templateUrl: './income-list.html',
  styleUrl: './income-list.css',
})
export class IncomeList implements OnInit {
  // dependencias
  private router = inject(Router);
  private income_service = inject(IncomeService);
  private user_service = inject(UserService);
  private payment_method_service = inject(PaymentMethodService);
  private platform_id = inject(PLATFORM_ID);

  // datos de ingresos
  protected data = signal<income_list_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_user = signal<number | null>(null);
  protected selected_payment_method = signal<number | null>(null);
  protected date_from = signal<string | null>(null);
  protected date_to = signal<string | null>(null);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Ingresos', active: true}
  ]);

  // computados para nombres seleccionados
  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Todos';
    return this.users().find(u => u.id === id)?.username ?? 'Todos';
  });

  protected selected_payment_method_name = computed(() => {
    const id = this.selected_payment_method();
    if (!id) return 'Todos';
    return this.payment_methods().find(p => p.id === id)?.name ?? 'Todos';
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
      this.load_users();
      this.load_payment_methods();
      this.load_incomes();
    }
  }

  // carga usuarios
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

  // carga ingresos
  private load_incomes(): void {
    this.loading.set(true);

    this.income_service.get_incomes(
      this.current_page(),
      this.page_size(),
      this.selected_user(),
      this.selected_payment_method(),
      this.date_from(),
      this.date_to()
    ).subscribe({
      next: (response) => {
        this.data.set(response.content);
        this.total_items.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.loading.set(false);
      }
    });
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_user_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
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

  // seleccion de filtros
  protected on_user_select(user_id: number | null): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.current_page.set(1);
    this.load_incomes();
  }

  protected on_payment_method_select(payment_id: number | null): void {
    this.selected_payment_method.set(payment_id);
    this.open_payment_method_dropdown.set(false);
    this.current_page.set(1);
    this.load_incomes();
  }

  // maneja cambio de rango de fechas
  protected on_date_range_change(range: { from: string | null; to: string | null }): void {
    this.date_from.set(range.from);
    this.date_to.set(range.to);
    this.current_page.set(1);
    this.load_incomes();
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_incomes();
  }

  // navega a preview con id
  protected on_income_click(income_id: number): void {
    this.router.navigate(['/layout/incomes/preview', income_id]);
  }

  // formateo de numeros
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}