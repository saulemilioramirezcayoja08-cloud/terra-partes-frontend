import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {ActivatedRoute, Router} from '@angular/router';
import {ContextFormService} from '../../../../../shared/services/context-form-service';
import {ProductService} from '../../services/product-service';
import {product_create_response} from '../../models/response/product-create-response.model';
import {isPlatformBrowser} from '@angular/common';
import {CategoryService} from '../../../../../shared/services/api/category-service';
import {UomService} from '../../../../../shared/services/static/uom-service';
import {OriginService} from '../../../../../shared/services/static/origin-service';
import {CodeTypeService} from '../../../../../shared/services/static/code-type-service';
import {category_list_response} from '../../../../../shared/models/api/response/category-list-response.model';
import {static_option} from '../../../../../shared/models/common/static-option.model';
import {FormsModule} from '@angular/forms';

// interfaz para codes editables
interface editable_code {
  id: number | null;
  type: string;
  code: string;
}

@Component({
  selector: 'app-product-preview',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './product-preview.html',
  styleUrl: './product-preview.css',
})
export class ProductPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private product_service = inject(ProductService);
  private category_service = inject(CategoryService);
  private uom_service = inject(UomService);
  private origin_service = inject(OriginService);
  private code_type_service = inject(CodeTypeService);

  // contexto
  private readonly context = 'product';

  // datos del producto
  protected product = signal<product_create_response | null>(null);
  private original_data = signal<product_create_response | null>(null);
  protected loading = signal<boolean>(false);
  protected saving = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // catalogos
  protected categories = signal<category_list_response[]>([]);
  protected uoms = signal<static_option[]>([]);
  protected origins = signal<static_option[]>([]);
  protected code_types = signal<static_option[]>([]);

  // campos editables
  protected sku = signal<string>('');
  protected name = signal<string>('');
  protected description = signal<string>('');
  protected price = signal<number>(0);
  protected selected_category = signal<number | null>(null);
  protected selected_uom = signal<string>('');
  protected selected_origin = signal<string>('');

  // codes editables
  protected codes = signal<editable_code[]>([]);

  // campos para agregar code
  protected selected_code_type = signal<string>('OEM');
  protected code_value = signal<string>('');
  protected code_error = signal<string | null>(null);

  // estado de dropdowns
  protected open_category_dropdown = signal<boolean>(false);
  protected open_uom_dropdown = signal<boolean>(false);
  protected open_origin_dropdown = signal<boolean>(false);
  protected open_code_type_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Productos'},
    {label: 'Vista Previa', active: true}
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);
  protected has_id = computed(() => !!this.route.snapshot.paramMap.get('id'));

  protected origin_label = computed(() => {
    const origin = this.selected_origin();
    const found = this.origins().find(o => o.code === origin);
    return found ? found.label : origin;
  });

  protected selected_category_name = computed(() => {
    const id = this.selected_category();
    if (!id) return 'Sin categoría';
    return this.categories().find(c => c.id === id)?.name ?? 'Sin categoría';
  });

  protected selected_uom_name = computed(() => {
    const code = this.selected_uom();
    if (!code) return 'Seleccionar UOM...';
    return this.uoms().find(u => u.code === code)?.code ?? code;
  });

  protected selected_origin_name = computed(() => {
    const code = this.selected_origin();
    if (!code) return 'Seleccionar procedencia...';
    return this.origins().find(o => o.code === code)?.label ?? code;
  });

  protected selected_code_type_name = computed(() => {
    const code = this.selected_code_type();
    return this.code_types().find(c => c.code === code)?.code ?? code;
  });

  protected can_add_code = computed(() => {
    return this.selected_code_type() !== '' && this.code_value().trim() !== '';
  });

  protected codes_count = computed(() => this.codes().length);

  // detecta cambios comparando con datos originales
  protected has_changes = computed(() => {
    const original = this.original_data();
    if (!original) return false;

    // compara campos basicos
    if (this.sku() !== original.product.sku) return true;
    if (this.name() !== original.product.name) return true;
    if (this.description() !== (original.product.description ?? '')) return true;
    if (this.selected_category() !== (original.category?.id ?? null)) return true;
    if (this.selected_uom() !== original.product.uom) return true;
    if (this.price() !== original.product.price) return true;
    if (this.selected_origin() !== original.product.origin) return true;

    // compara codes
    const current_codes = this.codes();
    const original_codes = original.codes;

    if (current_codes.length !== original_codes.length) return true;

    for (let i = 0; i < current_codes.length; i++) {
      const curr = current_codes[i];
      if (curr.id === null) return true; // code nuevo
      const orig = original_codes.find(c => c.id === curr.id);
      if (!orig) return true;
      if (curr.type !== orig.type || curr.code !== orig.code) return true;
    }

    // verifica si se elimino algun code original
    const current_ids = current_codes.filter(c => c.id !== null).map(c => c.id);
    for (const orig of original_codes) {
      if (!current_ids.includes(orig.id)) return true;
    }

    return false;
  });

  protected is_valid_form = computed(() => {
    return this.sku().trim() !== '' &&
      this.name().trim() !== '' &&
      this.selected_uom() !== '' &&
      this.price() > 0 &&
      this.selected_origin() !== '';
  });

  protected can_save = computed(() => this.has_changes() && this.is_valid_form() && !this.saving());

  @HostListener('document:click', ['$event'])
  on_document_click(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.close_all_dropdowns();
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_product();
    }
  }

  // carga producto desde api o desde servicio
  private load_product(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.load_catalogs();
      this.load_from_api(Number(id));
    } else {
      this.load_from_service();
    }
  }

  // carga catalogos para modo edicion
  private load_catalogs(): void {
    this.category_service.get_categories().subscribe({
      next: (response) => this.categories.set(response),
      error: (err) => console.error(err.error)
    });
    this.uoms.set(this.uom_service.get_uoms());
    this.origins.set(this.origin_service.get_origins());
    this.code_types.set(this.code_type_service.get_code_types());
  }

  // carga producto desde api
  private load_from_api(id: number): void {
    this.loading.set(true);
    this.error_message.set(null);

    this.product_service.get_product(id).subscribe({
      next: (response) => {
        this.product.set(response);
        this.original_data.set(structuredClone(response));
        this.populate_form(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error_message.set(err.error?.message ?? 'Error al cargar el producto');
        this.loading.set(false);
      }
    });
  }

  // carga producto desde servicio
  private load_from_service(): void {
    const last_product = this.context_form_service.get_last_product(this.context);
    if (last_product) {
      this.product.set(last_product);
      this.populate_form(last_product);
    } else {
      this.router.navigate(['/layout/products/create']);
    }
  }

  // popula campos editables con datos del producto
  private populate_form(data: product_create_response): void {
    this.sku.set(data.product.sku);
    this.name.set(data.product.name);
    this.description.set(data.product.description ?? '');
    this.price.set(data.product.price);
    this.selected_category.set(data.category?.id ?? null);
    this.selected_uom.set(data.product.uom);
    this.selected_origin.set(data.product.origin);
    this.codes.set(data.codes.map(c => ({
      id: c.id,
      type: c.type,
      code: c.code
    })));
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_category_dropdown.set(false);
    this.open_uom_dropdown.set(false);
    this.open_origin_dropdown.set(false);
    this.open_code_type_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_category_dropdown(): void {
    const current = this.open_category_dropdown();
    this.close_all_dropdowns();
    this.open_category_dropdown.set(!current);
  }

  protected toggle_uom_dropdown(): void {
    const current = this.open_uom_dropdown();
    this.close_all_dropdowns();
    this.open_uom_dropdown.set(!current);
  }

  protected toggle_origin_dropdown(): void {
    const current = this.open_origin_dropdown();
    this.close_all_dropdowns();
    this.open_origin_dropdown.set(!current);
  }

  protected toggle_code_type_dropdown(): void {
    const current = this.open_code_type_dropdown();
    this.close_all_dropdowns();
    this.open_code_type_dropdown.set(!current);
  }

  // seleccion de dropdowns
  protected on_category_select(category_id: number | null): void {
    this.selected_category.set(category_id);
    this.open_category_dropdown.set(false);
  }

  protected on_uom_select(uom_code: string): void {
    this.selected_uom.set(uom_code);
    this.open_uom_dropdown.set(false);
  }

  protected on_origin_select(origin_code: string): void {
    this.selected_origin.set(origin_code);
    this.open_origin_dropdown.set(false);
  }

  protected on_code_type_select(code_type: string): void {
    this.selected_code_type.set(code_type);
    this.open_code_type_dropdown.set(false);
  }

  // agrega code nuevo
  protected add_code(): void {
    if (!this.can_add_code()) return;

    // validar codigo duplicado
    const new_code_value = this.code_value().trim();
    const exists = this.codes().some(c => c.code === new_code_value);
    if (exists) {
      this.code_error.set('El código "' + new_code_value + '" ya existe en este producto');
      return;
    }

    this.code_error.set(null);

    const new_code: editable_code = {
      id: null,
      type: this.selected_code_type(),
      code: new_code_value
    };

    this.codes.update(codes => [...codes, new_code]);
    this.code_value.set('');
  }

  // actualiza code existente
  protected update_code_value(index: number, value: string): void {
    this.codes.update(codes => {
      const updated = [...codes];
      updated[index] = {...updated[index], code: value};
      return updated;
    });
  }

  // elimina code
  protected remove_code(index: number): void {
    this.codes.update(codes => codes.filter((_, i) => i !== index));
  }

  // descarta cambios y restaura valores originales
  protected on_discard(): void {
    const original = this.original_data();
    if (original) {
      this.populate_form(original);
    }
  }

  // guarda cambios via PUT
  protected on_save(): void {
    if (!this.can_save()) return;

    const id = this.product()?.product.id;
    if (!id) return;

    this.saving.set(true);

    const request = {
      sku: this.sku().trim(),
      name: this.name().trim(),
      description: this.description().trim() || null,
      category_id: this.selected_category(),
      uom: this.selected_uom(),
      price: this.price(),
      origin: this.selected_origin(),
      codes: this.codes().map(c => ({
        id: c.id,
        type: c.type,
        code: c.code
      }))
    };

    this.product_service.update(id, request).subscribe({
      next: (response) => {
        this.product.set(response);
        this.original_data.set(structuredClone(response));
        this.populate_form(response);
        this.saving.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.saving.set(false);
      }
    });
  }

  // vuelve atras usando historial del navegador
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/products/list']);
    }
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

  protected format_datetime(date: string): string {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
