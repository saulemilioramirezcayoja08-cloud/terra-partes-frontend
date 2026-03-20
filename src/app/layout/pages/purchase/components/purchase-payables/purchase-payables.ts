import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { Paginator } from '../../../../../shared/components/paginator/paginator';
import { DateRange } from '../../../../../shared/components/date-range/date-range';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { PurchaseService } from '../../services/purchase-service';
import { PaymentMethodService } from '../../../../../shared/services/api/payment-method-service';
import { purchase_payables_response } from '../../models/response/purchase-payables-response.model';
import { supplier_list_response } from '../../../../../shared/models/api/response/supplier-list-response.model';
import { payment_method_list_response } from '../../../../../shared/models/api/response/payment-method-list-response.model';
import { SupplierService } from '../../../../../shared/services/api/supplier-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-payables',
  imports: [Breadcrumb, Paginator, DateRange, DatePipe],
  templateUrl: './purchase-payables.html',
  styleUrl: './purchase-payables.css',
})
export class PurchasePayables implements OnInit {
  // dependencias
  private purchase_service = inject(PurchaseService);
  private supplier_service = inject(SupplierService);
  private payment_method_service = inject(PaymentMethodService);
  private platform_id = inject(PLATFORM_ID);
  private router = inject(Router);

  // datos
  protected data = signal<purchase_payables_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected suppliers = signal<supplier_list_response[]>([]);
  protected payment_methods = signal<payment_method_list_response[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_supplier = signal<number | null>(null);
  protected selected_payment_method = signal<number | null>(null);
  protected date_from = signal<string | null>(null);
  protected date_to = signal<string | null>(null);

  // estado de expandidos
  protected expanded_items = signal<Set<number>>(new Set());

  // estado de dropdowns
  protected open_supplier_dropdown = signal<boolean>(false);
  protected open_payment_method_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Compras' },
    { label: 'Cuentas por Pagar', active: true }
  ]);

  // computados
  protected selected_supplier_name = computed(() => {
    const id = this.selected_supplier();
    if (!id) return 'Todos';
    return this.suppliers().find(s => s.id === id)?.name ?? 'Todos';
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
      this.load_suppliers();
      this.load_payment_methods();
      this.load_data();
    }
  }

  // carga proveedores
  private load_suppliers(): void {
    this.supplier_service.get_suppliers().subscribe({
      next: (response) => this.suppliers.set(response),
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

  // carga cuentas por pagar
  private load_data(): void {
    this.loading.set(true);

    this.purchase_service.get_payables(
      this.current_page(),
      this.page_size(),
      this.selected_supplier(),
      null,
      this.selected_payment_method(),
      this.date_from(),
      this.date_to()
    ).subscribe({
      next: (response) => {
        this.data.set(response.content);
        this.total_items.set(response.totalElements);
        this.expanded_items.set(new Set());
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
    this.open_supplier_dropdown.set(false);
    this.open_payment_method_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_supplier_dropdown(): void {
    const current = this.open_supplier_dropdown();
    this.close_all_dropdowns();
    this.open_supplier_dropdown.set(!current);
  }

  protected toggle_payment_method_dropdown(): void {
    const current = this.open_payment_method_dropdown();
    this.close_all_dropdowns();
    this.open_payment_method_dropdown.set(!current);
  }

  // seleccion de proveedor
  protected on_supplier_select(supplier_id: number | null): void {
    this.selected_supplier.set(supplier_id);
    this.open_supplier_dropdown.set(false);
    this.current_page.set(1);
    this.load_data();
  }

  // seleccion de metodo de pago
  protected on_payment_method_select(payment_id: number | null): void {
    this.selected_payment_method.set(payment_id);
    this.open_payment_method_dropdown.set(false);
    this.current_page.set(1);
    this.load_data();
  }

  // maneja cambio de rango de fechas
  protected on_date_range_change(range: { from: string | null; to: string | null }): void {
    this.date_from.set(range.from);
    this.date_to.set(range.to);
    this.current_page.set(1);
    this.load_data();
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_data();
  }

  // toggle expandir/colapsar pagos
  protected toggle_expand(purchase_id: number): void {
    const current = new Set(this.expanded_items());
    if (current.has(purchase_id)) {
      current.delete(purchase_id);
    } else {
      current.add(purchase_id);
    }
    this.expanded_items.set(current);
  }

  // navega a preview de compra
  protected on_purchase_click(purchase_id: number): void {
    this.router.navigate(['/layout/purchases/preview', purchase_id]);
  }

  // verifica si un item esta expandido
  protected is_expanded(purchase_id: number): boolean {
    return this.expanded_items().has(purchase_id);
  }

  // clase css segun balance
  protected get_balance_class(balance: number): string {
    if (balance === 0) return 'success';
    return 'warning';
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}