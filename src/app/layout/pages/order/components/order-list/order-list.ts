import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {Paginator} from '../../../../../shared/components/paginator/paginator';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import { DateRange } from "../../../../../shared/components/date-range/date-range";
import {OrderService} from '../../services/order-service';
import {UserService} from '../../../../../shared/services/api/user-service';
import {CustomerService} from '../../../../../shared/services/api/customer-service';
import {StatusService} from '../../../../../shared/services/static/status-service';
import {PaymentMethodService} from '../../../../../shared/services/api/payment-method-service';
import {order_list_response} from '../../models/response/order-list-response.model';
import {user_list_response} from '../../../../../shared/models/api/response/user-list-response.model';
import {customer_list_response} from '../../../../../shared/models/api/response/customer-list-response.model';
import {static_option} from '../../../../../shared/models/common/static-option.model';
import {payment_method_list_response} from '../../../../../shared/models/api/response/payment-method-list-response.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-order-list',
  imports: [Breadcrumb, Paginator, DateRange, DatePipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements OnInit {
  // dependencias
  private router = inject(Router);
  private order_service = inject(OrderService);
  private user_service = inject(UserService);
  private customer_service = inject(CustomerService);
  private status_service = inject(StatusService);
  private payment_method_service = inject(PaymentMethodService);
  private platform_id = inject(PLATFORM_ID);

  // datos de ordenes
  protected data = signal<order_list_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected customers = signal<customer_list_response[]>([]);
  protected statuses = signal<static_option[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_user = signal<number | null>(null);
  protected selected_customer = signal<number | null>(null);
  protected selected_status = signal<string | null>(null);
  protected selected_payment_method = signal<number | null>(null);
  protected date_from = signal<string | null>(null);
  protected date_to = signal<string | null>(null);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_customer_dropdown = signal<boolean>(false);
  protected open_status_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Órdenes', active: true}
  ]);

  // computados para nombres seleccionados
  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Todos';
    return this.users().find(u => u.id === id)?.username ?? 'Todos';
  });

  protected selected_customer_name = computed(() => {
    const id = this.selected_customer();
    if (!id) return 'Todos';
    return this.customers().find(c => c.id === id)?.name ?? 'Todos';
  });

  protected selected_status_name = computed(() => {
    const code = this.selected_status();
    if (!code) return 'Todos';
    return this.statuses().find(s => s.code === code)?.label ?? 'Todos';
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
      this.load_customers();
      this.load_statuses();
      this.load_payment_methods();
      this.load_orders();
    }
  }

  // carga usuarios
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

  // carga estados
  private load_statuses(): void {
    const statuses = this.status_service.get_statuses();
    const order_statuses = statuses.filter(s =>
      ['PENDING', 'COMPLETED', 'VOIDED'].includes(s.code)
    );
    this.statuses.set(order_statuses);
  }

  // carga metodos de pago
  private load_payment_methods(): void {
    this.payment_method_service.get_payment_methods().subscribe({
      next: (response) => this.payment_methods.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga ordenes
  private load_orders(): void {
    this.loading.set(true);

    this.order_service.get_orders(
      this.current_page(),
      this.page_size(),
      this.selected_user(),
      this.selected_customer(),
      this.selected_status(),
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
    this.open_customer_dropdown.set(false);
    this.open_status_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
  }

  // toggles de dropdowns
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

  protected toggle_status_dropdown(): void {
    const current = this.open_status_dropdown();
    this.close_all_dropdowns();
    this.open_status_dropdown.set(!current);
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
    this.load_orders();
  }

  protected on_customer_select(customer_id: number | null): void {
    this.selected_customer.set(customer_id);
    this.open_customer_dropdown.set(false);
    this.current_page.set(1);
    this.load_orders();
  }

  protected on_status_select(status: string | null): void {
    this.selected_status.set(status);
    this.open_status_dropdown.set(false);
    this.current_page.set(1);
    this.load_orders();
  }

  protected on_payment_method_select(payment_id: number | null): void {
    this.selected_payment_method.set(payment_id);
    this.open_payment_method_dropdown.set(false);
    this.current_page.set(1);
    this.load_orders();
  }

  // maneja cambio de rango de fechas
  protected on_date_range_change(range: { from: string | null; to: string | null }): void {
    this.date_from.set(range.from);
    this.date_to.set(range.to);
    this.current_page.set(1);
    this.load_orders();
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_orders();
  }

  // navega a preview con id
  protected on_order_click(order_id: number): void {
    this.router.navigate(['/layout/orders/preview', order_id]);
  }

  // obtiene label de estado
  protected get_status_label(status: string): string {
    return this.statuses().find(s => s.code === status)?.label ?? status;
  }

  // formateo de numeros
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}
