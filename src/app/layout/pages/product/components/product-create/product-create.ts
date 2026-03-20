import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {FormsModule} from '@angular/forms';
import {ContextFormService} from '../../../../../shared/services/context-form-service';
import {CategoryService} from '../../../../../shared/services/api/category-service';
import {UomService} from '../../../../../shared/services/static/uom-service';
import {OriginService} from '../../../../../shared/services/static/origin-service';
import {CodeTypeService} from '../../../../../shared/services/static/code-type-service';
import {ProductService} from '../../services/product-service';
import {UserService} from '../../../../../shared/services/api/user-service';
import {user_list_response} from '../../../../../shared/models/api/response/user-list-response.model';
import {category_list_response} from '../../../../../shared/models/api/response/category-list-response.model';
import {static_option} from '../../../../../shared/models/common/static-option.model';
import {product_create_response} from '../../models/response/product-create-response.model';
import {product_context_form} from '../../../../../shared/models/context/product-context-form.model';
import {isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-product-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
})
export class ProductCreate implements OnInit {
  // dependencias
  private platform_id = inject(PLATFORM_ID);
  private router = inject(Router);
  private context_form_service = inject(ContextFormService);
  private user_service = inject(UserService);
  private category_service = inject(CategoryService);
  private uom_service = inject(UomService);
  private origin_service = inject(OriginService);
  private code_type_service = inject(CodeTypeService);
  private product_service = inject(ProductService);

  // contexto
  private readonly context = 'product';

  // catalogos
  protected users = signal<user_list_response[]>([]);
  protected categories = signal<category_list_response[]>([]);
  protected uoms = signal<static_option[]>([]);
  protected origins = signal<static_option[]>([]);
  protected code_types = signal<static_option[]>([]);

  // codes del producto
  protected codes = signal<product_context_form['codes']>([]);

  // ultimo producto creado
  protected last_product = signal<product_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected selected_category = signal<number | null>(null);
  protected selected_uom = signal<string>('PZA');
  protected selected_origin = signal<string>('OR');
  protected sku = signal<string>('');
  protected name = signal<string>('');
  protected description = signal<string>('');
  protected price = signal<number>(0);
  protected loading = signal<boolean>(false);

  // campos para agregar code
  protected selected_code_type = signal<string>('OEM');
  protected code_value = signal<string>('');
  protected code_error = signal<string | null>(null);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);
  protected open_category_dropdown = signal<boolean>(false);
  protected open_uom_dropdown = signal<boolean>(false);
  protected open_origin_dropdown = signal<boolean>(false);
  protected open_code_type_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Productos'},
    {label: 'Crear', active: true}
  ]);

  // computados
  protected codes_count = computed(() => this.codes().length);

  protected has_last_product = computed(() => this.last_product() !== null);

  protected is_valid_form = computed(() => {
    return this.selected_user() !== null &&
      this.sku().trim() !== '' &&
      this.name().trim() !== '' &&
      this.selected_uom() !== '' &&
      this.price() > 0 &&
      this.selected_origin() !== '';
  });

  protected can_add_code = computed(() => {
    return this.selected_code_type() !== '' && this.code_value().trim() !== '';
  });

  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Seleccionar usuario...';
    return this.users().find(u => u.id === id)?.name ?? 'Seleccionar usuario...';
  });

  protected selected_category_name = computed(() => {
    const id = this.selected_category();
    if (!id) return 'Sin categoría';
    return this.categories().find(c => c.id === id)?.name ?? 'Sin categoría';
  });

  protected selected_uom_name = computed(() => {
    const code = this.selected_uom();
    if (!code) return 'Seleccionar UOM...';
    const uom = this.uoms().find(u => u.code === code);
    return uom ? `${uom.code}` : code;
  });

  protected selected_origin_name = computed(() => {
    const code = this.selected_origin();
    if (!code) return 'Seleccionar procedencia...';
    return this.origins().find(o => o.code === code)?.label ?? code;
  });

  protected selected_code_type_name = computed(() => {
    const code = this.selected_code_type();
    if (!code) return 'Seleccionar tipo...';
    return this.code_types().find(c => c.code === code)?.code ?? code;
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

  // carga catalogos
  private load_catalogs(): void {
    this.load_users();
    this.load_categories();
    this.load_uoms();
    this.load_origins();
    this.load_code_types();
  }

  private load_users(): void {
    this.user_service.get_users().subscribe({
      next: (response) => this.users.set(response),
      error: (err) => console.error(err.error)
    });
  }

  private load_categories(): void {
    this.category_service.get_categories().subscribe({
      next: (response) => this.categories.set(response),
      error: (err) => console.error(err.error)
    });
  }

  private load_uoms(): void {
    this.uoms.set(this.uom_service.get_uoms());
  }

  private load_origins(): void {
    this.origins.set(this.origin_service.get_origins());
  }

  private load_code_types(): void {
    this.code_types.set(this.code_type_service.get_code_types());
  }

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_product_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.sku.set(data.form.sku);
    this.name.set(data.form.name);
    this.description.set(data.form.description);
    this.selected_category.set(data.form.category_id);
    this.selected_uom.set(data.form.uom);
    this.price.set(data.form.price);
    this.selected_origin.set(data.form.origin);
    this.codes.set([...data.codes]);
    this.last_product.set(data.last_product);
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_product_form(this.context, {
      user_id: this.selected_user(),
      sku: this.sku(),
      name: this.name(),
      description: this.description(),
      category_id: this.selected_category(),
      uom: this.selected_uom(),
      price: this.price(),
      origin: this.selected_origin()
    });
  }

  // cierra todos los dropdowns
  private close_all_dropdowns(): void {
    this.open_user_dropdown.set(false);
    this.open_category_dropdown.set(false);
    this.open_uom_dropdown.set(false);
    this.open_origin_dropdown.set(false);
    this.open_code_type_dropdown.set(false);
  }

  // toggles de dropdowns
  protected toggle_user_dropdown(): void {
    const current = this.open_user_dropdown();
    this.close_all_dropdowns();
    this.open_user_dropdown.set(!current);
  }

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
  protected on_user_select(user_id: number): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_category_select(category_id: number | null): void {
    this.selected_category.set(category_id);
    this.open_category_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_uom_select(uom_code: string): void {
    this.selected_uom.set(uom_code);
    this.open_uom_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_origin_select(origin_code: string): void {
    this.selected_origin.set(origin_code);
    this.open_origin_dropdown.set(false);
    this.save_form_to_service();
  }

  protected on_code_type_select(code_type: string): void {
    this.selected_code_type.set(code_type);
    this.open_code_type_dropdown.set(false);
  }

  // agrega code a la lista
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

    const new_code: product_context_form['codes'][0] = {
      type: this.selected_code_type(),
      code: new_code_value
    };

    this.context_form_service.add_product_code(this.context, new_code);
    this.codes.set(this.context_form_service.get_product_codes(this.context));

    // limpia campos
    this.code_value.set('');
  }

  // actualiza code existente
  protected update_code_value(index: number, value: string): void {
    this.context_form_service.update_product_code(this.context, index, {code: value});
    this.codes.set(this.context_form_service.get_product_codes(this.context));
  }

  // elimina code
  protected remove_code(index: number): void {
    this.context_form_service.remove_product_code(this.context, index);
    this.codes.set(this.context_form_service.get_product_codes(this.context));
  }

  // acciones
  protected on_cancel(): void {
    this.context_form_service.clear_product(this.context);
    this.load_form_from_service();
  }

  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = {
      user_id: this.selected_user()!,
      sku: this.sku().trim(),
      name: this.name().trim(),
      description: this.description().trim() || null,
      category_id: this.selected_category(),
      uom: this.selected_uom(),
      price: this.price(),
      origin: this.selected_origin(),
      codes: this.codes().map(code => ({
        type: code.type,
        code: code.code
      }))
    };

    this.product_service.create(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_product(this.context, response);
        this.last_product.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_product
        this.context_form_service.update_product_form(this.context, {
          user_id: null,
          sku: '',
          name: '',
          description: '',
          category_id: null,
          uom: 'PZA',
          price: 0,
          origin: 'OR'
        });
        this.context_form_service.clear_product_codes(this.context);
        this.load_form_from_service();
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.loading.set(false);
      }
    });
  }

  // navega a vista previa del ultimo producto creado
  protected on_preview(): void {
    this.router.navigate(['/layout/products/preview']);
  }
}
