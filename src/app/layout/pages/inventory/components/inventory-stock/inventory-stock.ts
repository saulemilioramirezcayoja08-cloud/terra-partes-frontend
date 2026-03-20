import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {Paginator} from '../../../../../shared/components/paginator/paginator';
import {FormsModule} from '@angular/forms';
import {InventoryService} from '../../services/inventory-service';
import {CategoryService} from '../../../../../shared/services/api/category-service';
import {inventory_stock_response} from '../../models/response/inventory-stock-response.model';
import {category_list_response} from '../../../../../shared/models/api/response/category-list-response.model';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-inventory-stock',
  imports: [Breadcrumb, Paginator, FormsModule],
  templateUrl: './inventory-stock.html',
  styleUrl: './inventory-stock.css',
})
export class InventoryStock implements OnInit {
  // dependencias
  private inventory_service = inject(InventoryService);
  private category_service = inject(CategoryService);
  private platform_id = inject(PLATFORM_ID);

  // datos de inventario
  protected data = signal<inventory_stock_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // catalogos
  protected categories = signal<category_list_response[]>([]);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected selected_category = signal<number | null>(null);
  protected search_text = signal<string>('');
  protected search_type = signal<string>('NAME');

  // estado de dropdowns
  protected open_category_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Inventario'},
    {label: 'Stock', active: true}
  ]);

  // labels de busqueda
  protected search_type_labels: Record<string, string> = {
    'NAME': 'Nombre del producto',
    'SKU': 'Código Int.'
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
      this.load_stock();
    }
  }

  // carga categorias
  private load_categories(): void {
    this.category_service.get_categories().subscribe({
      next: (response) => this.categories.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga stock
  private load_stock(): void {
    this.loading.set(true);

    const sku = this.search_type() === 'SKU' ? this.search_text() : null;
    const name = this.search_type() === 'NAME' ? this.search_text() : null;

    this.inventory_service.get_stock(
      this.current_page(),
      this.page_size(),
      null,
      this.selected_category(),
      sku,
      name
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
  }

  // toggle de dropdown
  protected toggle_category_dropdown(): void {
    const current = this.open_category_dropdown();
    this.close_all_dropdowns();
    this.open_category_dropdown.set(!current);
  }

  // seleccion de categoria
  protected on_category_select(category_id: number | null): void {
    this.selected_category.set(category_id);
    this.open_category_dropdown.set(false);
    this.current_page.set(1);
    this.load_stock();
  }

  // cambio en busqueda
  protected on_search_change(): void {
    this.current_page.set(1);
    this.load_stock();
  }

  // cambio de tipo de busqueda
  protected on_search_type_change(type: string): void {
    this.search_type.set(type);
    if (this.search_text().trim()) {
      this.current_page.set(1);
      this.load_stock();
    }
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_stock();
  }
}
