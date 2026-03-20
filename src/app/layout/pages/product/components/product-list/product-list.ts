import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {Paginator} from '../../../../../shared/components/paginator/paginator';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../services/product-service';
import {CategoryService} from '../../../../../shared/services/api/category-service';
import {CodeTypeService} from '../../../../../shared/services/static/code-type-service';
import {product_list_response} from '../../models/response/product-list-response.model';
import {category_list_response} from '../../../../../shared/models/api/response/category-list-response.model';
import {static_option} from '../../../../../shared/models/common/static-option.model';
import {isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [Breadcrumb, Paginator, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  // dependencias
  private router = inject(Router);
  private product_service = inject(ProductService);
  private category_service = inject(CategoryService);
  private code_type_service = inject(CodeTypeService);
  private platform_id = inject(PLATFORM_ID);

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

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Productos'},
    {label: 'Listado', active: true}
  ]);

  // labels de busqueda
  protected search_type_labels: Record<string, string> = {
    'NAME': 'Nombre del producto',
    'SKU': 'Código Cod. Int.',
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
      this.load_code_types();
      this.load_products();
    }
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

  // navega a preview con id
  protected on_product_click(product_id: number): void {
    this.router.navigate(['/layout/products/preview', product_id]);
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected format_nullable(amount: number | null): string {
    return amount !== null ? amount.toFixed(2) : '-';
  }
}
