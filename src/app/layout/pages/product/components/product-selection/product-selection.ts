import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {Paginator} from '../../../../../shared/components/paginator/paginator';
import {CategoryService} from '../../../../../shared/services/api/category-service';
import {CodeTypeService} from '../../../../../shared/services/static/code-type-service';
import {ProductService} from '../../services/product-service';
import {product_list_response} from '../../models/response/product-list-response.model';
import {category_list_response} from '../../../../../shared/models/api/response/category-list-response.model';
import {ContextFormService} from '../../../../../shared/services/context-form-service';
import {static_option} from '../../../../../shared/models/common/static-option.model';

@Component({
  selector: 'app-product-selection',
  imports: [Breadcrumb, Paginator, FormsModule],
  templateUrl: './product-selection.html',
  styleUrl: './product-selection.css',
})
export class ProductSelection implements OnInit {
  // dependencias
  private product_service = inject(ProductService);
  private context_form_service = inject(ContextFormService);
  private category_service = inject(CategoryService);
  private code_type_service = inject(CodeTypeService);
  private platform_id = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // configuracion de ruta
  protected context = signal<string>('');
  protected return_route = signal<string>('');

  // datos de productos
  protected data = signal<product_list_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected categories = signal<category_list_response[]>([]);
  protected code_types = signal<static_option[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_category = signal<number | null>(null);
  protected search_text = signal<string>('');
  protected search_type = signal<string>('NAME');
  protected selected_code_type = signal<string>('OEM');

  // estado de dropdowns
  protected open_category_dropdown = signal<boolean>(false);
  protected open_code_type_dropdown = signal<boolean>(false);

  // seleccion temporal en memoria
  protected selected_products = signal<Map<number, product_list_response>>(new Map());

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([]);

  // labels de busqueda
  protected search_type_labels: Record<string, string> = {
    'NAME': 'Nombre del producto',
    'SKU': 'Código Int.',
    'CODE': 'Código'
  };

  // computados
  protected search_type_label = computed(() => {
    if (this.search_type() === 'CODE') {
      const ct = this.code_types().find(c => c.code === this.selected_code_type());
      return ct ? `Código ${ct.code}` : 'Código';
    }
    return this.search_type_labels[this.search_type()];
  });

  protected selected_category_name = computed(() => {
    const id = this.selected_category();
    if (!id) return 'Todas';
    return this.categories().find(c => c.id === id)?.name ?? 'Todas';
  });

  protected selected_code_type_name = computed(() => {
    const ct = this.code_types().find(c => c.code === this.selected_code_type());
    return ct ? ct.code : 'OEM';
  });

  protected selected_count = computed(() => this.selected_products().size);

  protected all_selected = computed(() => {
    const items = this.data();
    if (items.length === 0) return false;
    return items.every(item => this.selected_products().has(item.product.id));
  });

  @HostListener('document:click', ['$event'])
  on_document_click(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.close_all_dropdowns();
    }
  }

  @HostListener('document:keydown.escape')
  on_escape(): void {
    this.router.navigate([this.return_route()]);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      const route_data = this.route.snapshot.data;
      this.context.set(route_data['context'] || 'default');
      this.return_route.set(route_data['return_route'] || '/layout/dashboard');

      this.setup_breadcrumb();
      this.load_categories();
      this.load_code_types();
      this.load_existing_selection();
      this.load_products();
    }
  }

  // configura breadcrumb segun contexto
  private setup_breadcrumb(): void {
    const context_labels: Record<string, string> = {
      'order': 'Órdenes',
      'quotation': 'Cotizaciones',
      'purchase': 'Compras'
    };

    const label = context_labels[this.context()] || 'Productos';

    this.breadcrumb_items.set([
      {label},
      {label: 'Seleccionar Productos', active: true}
    ]);
  }

  // carga categorias
  private load_categories(): void {
    this.category_service.get_categories().subscribe({
      next: (response) => this.categories.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga tipos de codigo
  private load_code_types(): void {
    const types = this.code_type_service.get_code_types();
    this.code_types.set(types);
    if (types.length > 0) {
      this.selected_code_type.set(types[0].code);
    }
  }

  // carga seleccion existente desde el servicio
  private load_existing_selection(): void {
    const context = this.context();
    let existing_items: Map<number, any>;

    // selecciona metodo segun contexto
    if (context === 'purchase') {
      existing_items = this.context_form_service.get_purchase_items_map(context);
    } else if (context === 'quotation') {
      existing_items = this.context_form_service.get_quotation_items_map(context);
    } else {
      existing_items = this.context_form_service.get_items_map(context);
    }

    const selection_map = new Map<number, product_list_response>();

    existing_items.forEach((item, product_id) => {
      const partial_product: product_list_response = {
        product: {
          id: item.product.id,
          sku: item.product.sku,
          name: item.product.name,
          description: null,
          uom: item.product.uom,
          price: item.detail.price,
          origin: ''
        },
        category: item.category ? {id: 0, name: item.category.name} : null,
        codes: [],
        stock: {total: 0, reserved: 0, available: item.stock.available},
        last: {purchase: null, sale: null, quotation: null, order: null}
      };
      selection_map.set(product_id, partial_product);
    });

    this.selected_products.set(selection_map);
  }

  // carga productos
  private load_products(): void {
    this.loading.set(true);

    const code_type = this.search_type() === 'CODE' ? this.selected_code_type() : null;

    this.product_service.get_products(
      this.current_page(),
      this.page_size(),
      this.selected_category(),
      this.search_text(),
      this.search_type(),
      code_type
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
    this.open_category_dropdown.set(false);
    this.open_code_type_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_category_dropdown(): void {
    const current = this.open_category_dropdown();
    this.close_all_dropdowns();
    this.open_category_dropdown.set(!current);
  }

  protected toggle_code_type_dropdown(): void {
    const current = this.open_code_type_dropdown();
    this.close_all_dropdowns();
    this.open_code_type_dropdown.set(!current);
  }

  // seleccion de categoria
  protected on_category_select(category_id: number | null): void {
    this.selected_category.set(category_id);
    this.open_category_dropdown.set(false);
    this.current_page.set(1);
    this.load_products();
  }

  // seleccion de tipo de codigo
  protected on_code_type_select(code: string): void {
    this.selected_code_type.set(code);
    this.open_code_type_dropdown.set(false);
    if (this.search_text().trim()) {
      this.current_page.set(1);
      this.load_products();
    }
  }

  // cambio en busqueda
  protected on_search_change(): void {
    this.current_page.set(1);
    this.load_products();
  }

  // cambio de tipo de busqueda
  protected on_search_type_change(type: string): void {
    this.search_type.set(type);
    if (this.search_text().trim()) {
      this.current_page.set(1);
      this.load_products();
    }
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_products();
  }

  // verifica si producto esta seleccionado
  protected is_selected(id: number): boolean {
    return this.selected_products().has(id);
  }

  // toggle seleccion de producto
  protected toggle_selection(id: number): void {
    const item = this.data().find(d => d.product.id === id);
    if (!item) return;

    const new_map = new Map(this.selected_products());

    if (new_map.has(id)) {
      new_map.delete(id);
    } else {
      new_map.set(id, item);
    }

    this.selected_products.set(new_map);
  }

  // toggle seleccion de todos
  protected toggle_all(): void {
    const items = this.data();
    const new_map = new Map(this.selected_products());

    if (this.all_selected()) {
      items.forEach(item => new_map.delete(item.product.id));
    } else {
      items.forEach(item => new_map.set(item.product.id, item));
    }

    this.selected_products.set(new_map);
  }

  // limpia seleccion
  protected clear_selection(): void {
    this.selected_products.set(new Map());
  }

  // confirma seleccion y guarda en servicio
  protected on_confirm(): void {
    const context = this.context();
    const selected = Array.from(this.selected_products().values());

    // selecciona metodos segun contexto
    if (context === 'purchase') {
      this.context_form_service.clear_purchase_items(context);
      this.context_form_service.add_purchase_products(context, selected);
    } else if (context === 'quotation') {
      this.context_form_service.clear_quotation_items(context);
      this.context_form_service.add_quotation_products(context, selected);
    } else {
      this.context_form_service.clear_items(context);
      this.context_form_service.add_products(context, selected);
    }

    this.router.navigate([this.return_route()]);
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected format_nullable(amount: number | null): string {
    return amount !== null ? amount.toFixed(2) : '-';
  }
}
