import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {Paginator} from '../../../../../shared/components/paginator/paginator';
import {DateRange} from '../../../../../shared/components/date-range/date-range';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {PurchaseService} from '../../services/purchase-service';
import {UserService} from '../../../../../shared/services/api/user-service';
import {StatusService} from '../../../../../shared/services/static/status-service';
import {PaymentMethodService} from '../../../../../shared/services/api/payment-method-service';
import {purchase_list_response} from '../../models/response/purchase-list-response.model';
import {user_list_response} from '../../../../../shared/models/api/response/user-list-response.model';
import {supplier_list_response} from '../../../../../shared/models/api/response/supplier-list-response.model';
import {
  payment_method_list_response
} from '../../../../../shared/models/api/response/payment-method-list-response.model';
import {static_option} from '../../../../../shared/models/common/static-option.model';
import {SupplierService} from '../../../../../shared/services/api/supplier-service';

@Component({
  selector: 'app-purchase-list',
  imports: [Breadcrumb, Paginator, DateRange, DatePipe],
  templateUrl: './purchase-list.html',
  styleUrl: './purchase-list.css',
})
export class PurchaseList implements OnInit {
  // dependencias
  private router = inject(Router);
  private purchase_service = inject(PurchaseService);
  private user_service = inject(UserService);
  private supplier_service = inject(SupplierService);
  private status_service = inject(StatusService);
  private payment_method_service = inject(PaymentMethodService);
  private platform_id = inject(PLATFORM_ID);

  // datos de compras
  protected data = signal<purchase_list_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected suppliers = signal<supplier_list_response[]>([]);
  protected statuses = signal<static_option[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);
  protected types = signal<static_option[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_user = signal<number | null>(null);
  protected selected_supplier = signal<number | null>(null);
  protected selected_status = signal<string | null>(null);
  protected selected_payment_method = signal<number | null>(null);
  protected selected_type = signal<string | null>(null);
  protected date_from = signal<string | null>(null);
  protected date_to = signal<string | null>(null);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_supplier_dropdown = signal<boolean>(false);
  protected open_status_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);
  protected open_type_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Compras', active: true}
  ]);

  // computados para nombres seleccionados
  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Todos';
    return this.users().find(u => u.id === id)?.username ?? 'Todos';
  });

  protected selected_supplier_name = computed(() => {
    const id = this.selected_supplier();
    if (!id) return 'Todos';
    return this.suppliers().find(s => s.id === id)?.name ?? 'Todos';
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

  protected selected_type_name = computed(() => {
    const code = this.selected_type();
    if (!code) return 'Todos';
    return this.types().find(t => t.code === code)?.label ?? 'Todos';
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
      this.load_suppliers();
      this.load_statuses();
      this.load_payment_methods();
      this.load_types();
      this.load_purchases();
    }
  }

  // carga usuarios
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

  // carga estados
  private load_statuses(): void {
    const statuses = this.status_service.get_statuses();
    const purchase_statuses = statuses.filter(s =>
      ['PENDING', 'COMPLETED', 'VOIDED'].includes(s.code)
    );
    this.statuses.set(purchase_statuses);
  }

  // carga metodos de pago
  private load_payment_methods(): void {
    this.payment_method_service.get_payment_methods().subscribe({
      next: (response) => this.payment_methods.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga tipos de compra
  private load_types(): void {
    this.types.set([
      {code: 'LOCAL', label: 'Local'},
      {code: 'IMPORT', label: 'Importación'}
    ]);
  }

  // carga compras
  private load_purchases(): void {
    this.loading.set(true);

    this.purchase_service.get_purchases(
      this.current_page(),
      this.page_size(),
      this.selected_user(),
      this.selected_supplier(),
      this.selected_status(),
      this.selected_payment_method(),
      this.selected_type(),
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
    this.open_supplier_dropdown.set(false);
    this.open_status_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
    this.open_type_dropdown.set(false);
  }

  // toggles de dropdowns
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

  protected toggle_type_dropdown(): void {
    const current = this.open_type_dropdown();
    this.close_all_dropdowns();
    this.open_type_dropdown.set(!current);
  }

  // seleccion de filtros
  protected on_user_select(user_id: number | null): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.current_page.set(1);
    this.load_purchases();
  }

  protected on_supplier_select(supplier_id: number | null): void {
    this.selected_supplier.set(supplier_id);
    this.open_supplier_dropdown.set(false);
    this.current_page.set(1);
    this.load_purchases();
  }

  protected on_status_select(status: string | null): void {
    this.selected_status.set(status);
    this.open_status_dropdown.set(false);
    this.current_page.set(1);
    this.load_purchases();
  }

  protected on_payment_method_select(payment_id: number | null): void {
    this.selected_payment_method.set(payment_id);
    this.open_payment_method_dropdown.set(false);
    this.current_page.set(1);
    this.load_purchases();
  }

  protected on_type_select(type: string | null): void {
    this.selected_type.set(type);
    this.open_type_dropdown.set(false);
    this.current_page.set(1);
    this.load_purchases();
  }

  // maneja cambio de rango de fechas
  protected on_date_range_change(range: { from: string | null; to: string | null }): void {
    this.date_from.set(range.from);
    this.date_to.set(range.to);
    this.current_page.set(1);
    this.load_purchases();
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_purchases();
  }

  // navega a preview con id
  protected on_purchase_click(purchase_id: number): void {
    this.router.navigate(['/layout/purchases/preview', purchase_id]);
  }

  // obtiene label de estado
  protected get_status_label(status: string): string {
    return this.statuses().find(s => s.code === status)?.label ?? status;
  }

  // obtiene label de tipo
  protected get_type_label(type: string): string {
    return this.types().find(t => t.code === type)?.label ?? type;
  }

  // formateo de numeros
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}
