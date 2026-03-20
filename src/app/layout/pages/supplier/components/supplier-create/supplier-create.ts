import {Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../../../../shared/services/api/user-service';
import {SupplierService} from '../../services/supplier-service';
import {user_list_response} from '../../../../../shared/models/api/response/user-list-response.model';
import {supplier_create_response} from '../../models/response/supplier-create-response.model';
import {isPlatformBrowser} from '@angular/common';
import {ContextFormService} from '../../../../../shared/services/context-form-service';

@Component({
  selector: 'app-supplier-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './supplier-create.html',
  styleUrl: './supplier-create.css',
})
export class SupplierCreate implements OnInit {
  // dependencias
  private platform_id = inject(PLATFORM_ID);
  private router = inject(Router);
  private user_service = inject(UserService);
  private supplier_service = inject(SupplierService);
  private context_form_service = inject(ContextFormService);

  // contexto
  private readonly context = 'supplier';

  // catalogos
  protected users = signal<user_list_response[]>([]);

  // ultimo proveedor creado
  protected last_supplier = signal<supplier_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected tax_id = signal<string>('');
  protected name = signal<string>('');
  protected phone = signal<string>('');
  protected email = signal<string>('');
  protected address = signal<string>('');
  protected loading = signal<boolean>(false);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Proveedores'},
    {label: 'Crear', active: true}
  ]);

  // computados
  protected has_last_supplier = computed(() => this.last_supplier() !== null);

  protected is_valid_form = computed(() => {
    return this.selected_user() !== null &&
      this.name().trim() !== '';
  });

  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Seleccionar usuario...';
    return this.users().find(u => u.id === id)?.name ?? 'Seleccionar usuario...';
  });

  @HostListener('document:click', ['$event'])
  on_document_click(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.open_user_dropdown.set(false);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_users();
      this.load_form_from_service();
    }
  }

  // carga todos los usuarios
  private load_users(): void {
    this.user_service.get_users().subscribe({
      next: (response) => this.users.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_supplier_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.tax_id.set(data.form.tax_id);
    this.name.set(data.form.name);
    this.phone.set(data.form.phone);
    this.email.set(data.form.email);
    this.address.set(data.form.address);
    this.last_supplier.set(data.last_supplier);
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_supplier_form(this.context, {
      user_id: this.selected_user(),
      tax_id: this.tax_id(),
      name: this.name(),
      phone: this.phone(),
      email: this.email(),
      address: this.address()
    });
  }

  // toggle dropdown
  protected toggle_user_dropdown(): void {
    this.open_user_dropdown.update(v => !v);
  }

  // seleccion de usuario
  protected on_user_select(user_id: number): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.save_form_to_service();
  }

  // limpia formulario
  protected on_cancel(): void {
    this.context_form_service.clear_supplier(this.context);
    this.load_form_from_service();
  }

  // guarda proveedor
  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = {
      user_id: this.selected_user()!,
      tax_id: this.tax_id().trim() || null,
      name: this.name().trim(),
      phone: this.phone().trim() || null,
      email: this.email().trim() || null,
      address: this.address().trim() || null
    };

    this.supplier_service.create(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_supplier(this.context, response);
        this.last_supplier.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_supplier
        this.context_form_service.update_supplier_form(this.context, {
          user_id: null,
          tax_id: '',
          name: '',
          phone: '',
          email: '',
          address: ''
        });
        this.load_form_from_service();
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.loading.set(false);
      }
    });
  }

  // navega a vista previa
  protected on_preview(): void {
    this.router.navigate(['/layout/suppliers/preview']);
  }
}
