import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { Paginator } from '../../../../../shared/components/paginator/paginator';
import { FormsModule } from '@angular/forms';
import { DateRange } from '../../../../../shared/components/date-range/date-range';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SaleService } from '../../services/sale-service';
import { CategoryService } from '../../../../../shared/services/api/category-service';
import { CustomerService } from '../../../../../shared/services/api/customer-service';
import { sale_profit_response } from '../../models/response/sale-profit-response.model';
import { category_list_response } from '../../../../../shared/models/api/response/category-list-response.model';
import { customer_list_response } from '../../../../../shared/models/api/response/customer-list-response.model';

@Component({
  selector: 'app-sale-profit',
  imports: [Breadcrumb, Paginator, FormsModule, DatePipe, DateRange],
  templateUrl: './sale-profit.html',
  styleUrl: './sale-profit.css',
})
export class SaleProfit implements OnInit {
  // dependencias
  private router = inject(Router);
  private sale_service = inject(SaleService);
  private category_service = inject(CategoryService);
  private customer_service = inject(CustomerService);
  private platform_id = inject(PLATFORM_ID);

  // datos
  protected data = signal<sale_profit_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected categories = signal<category_list_response[]>([]);
  protected customers = signal<customer_list_response[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_category = signal<number | null>(null);
  protected selected_customer = signal<number | null>(null);
  protected search_text = signal<string>('');
  protected search_type = signal<string>('NAME');
  protected date_from = signal<string | null>(null);
  protected date_to = signal<string | null>(null);

  // estado de expandidos
  protected expanded_items = signal<Set<number>>(new Set());

  // estado de dropdowns
  protected open_category_dropdown = signal<boolean>(false);
  protected open_customer_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Ventas' },
    { label: 'Rentabilidad', active: true }
  ]);

  // labels de busqueda
  protected search_type_labels: Record<string, string> = {
    'NAME': 'Nombre del producto',
    'SKU': 'Cod. Int.'
  };

  // computados
  protected search_type_label = computed(() => {
    return this.search_type_labels[this.search_type()];
  });

  protected selected_category_name = computed(() => {
    const id = this.selected_category();
    if (!id) return 'Todas';
    return this.categories().find(c => c.id === id)?.name ?? 'Todas';
  });

  protected selected_customer_name = computed(() => {
    const id = this.selected_customer();
    if (!id) return 'Todos';
    return this.customers().find(c => c.id === id)?.name ?? 'Todos';
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
      this.load_categories();
      this.load_customers();
      this.load_data();
    }
  }

  // carga categorias
  private load_categories(): void {
    this.category_service.get_categories().subscribe({
      next: (response) => this.categories.set(response),
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

  // carga rentabilidad
  private load_data(): void {
    this.loading.set(true);

    const sku = this.search_type() === 'SKU' ? this.search_text() : null;
    const name = this.search_type() === 'NAME' ? this.search_text() : null;

    this.sale_service.get_profit(
      this.current_page(),
      this.page_size(),
      this.selected_customer(),
      null,
      this.selected_category(),
      sku,
      name,
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
    this.open_category_dropdown.set(false);
    this.open_customer_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_category_dropdown(): void {
    const current = this.open_category_dropdown();
    this.close_all_dropdowns();
    this.open_category_dropdown.set(!current);
  }

  protected toggle_customer_dropdown(): void {
    const current = this.open_customer_dropdown();
    this.close_all_dropdowns();
    this.open_customer_dropdown.set(!current);
  }

  // seleccion de categoria
  protected on_category_select(category_id: number | null): void {
    this.selected_category.set(category_id);
    this.open_category_dropdown.set(false);
    this.current_page.set(1);
    this.load_data();
  }

  // seleccion de cliente
  protected on_customer_select(customer_id: number | null): void {
    this.selected_customer.set(customer_id);
    this.open_customer_dropdown.set(false);
    this.current_page.set(1);
    this.load_data();
  }

  // cambio en busqueda
  protected on_search_change(): void {
    this.current_page.set(1);
    this.load_data();
  }

  // cambio de tipo de busqueda
  protected on_search_type_change(type: string): void {
    this.search_type.set(type);
    if (this.search_text().trim()) {
      this.current_page.set(1);
      this.load_data();
    }
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

  // toggle expandir/colapsar items
  protected toggle_expand(sale_id: number): void {
    const current = new Set(this.expanded_items());
    if (current.has(sale_id)) {
      current.delete(sale_id);
    } else {
      current.add(sale_id);
    }
    this.expanded_items.set(current);
  }

  // verifica si un item esta expandido
  protected is_expanded(sale_id: number): boolean {
    return this.expanded_items().has(sale_id);
  }

  // navega a trazabilidad de una venta
  protected on_traceability_click(sale_id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/layout/sales/profit', sale_id, 'traceability']);
  }

  // calcula total revenue de una venta
  protected get_total_revenue(item: sale_profit_response): number {
    return item.items.reduce((sum, i) => sum + i.revenue, 0);
  }

  // calcula total cost de una venta
  protected get_total_cost(item: sale_profit_response): number {
    return item.items.reduce((sum, i) => sum + i.cost, 0);
  }

  // calcula total margin de una venta
  protected get_total_margin(item: sale_profit_response): number {
    return item.items.reduce((sum, i) => sum + i.margin, 0);
  }

  // calcula porcentaje de margen
  protected get_margin_percent(margin: number, revenue: number): number {
    if (revenue === 0) return 0;
    return (margin / revenue) * 100;
  }

  // clase css segun margen
  protected get_margin_class(margin: number, revenue: number): string {
    const percent = this.get_margin_percent(margin, revenue);
    if (percent >= 20) return 'success';
    if (percent >= 0) return 'warning';
    return 'danger';
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}