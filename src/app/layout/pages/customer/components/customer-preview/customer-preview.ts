import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {ActivatedRoute, Router} from '@angular/router';
import {customer_create_response} from '../../models/response/customer-create-response.model';
import {customer_detail_response} from '../../models/response/customer-detail-response.model';
import {customer_update_response} from '../../models/response/customer-update-response.model';
import {isPlatformBrowser} from '@angular/common';
import {ContextFormService} from '../../../../../shared/services/context-form-service';
import {CustomerService} from '../../services/customer-service';
import {FormsModule} from '@angular/forms';

type customer_preview_response =
  | customer_create_response
  | customer_detail_response
  | customer_update_response;

@Component({
  selector: 'app-customer-preview',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './customer-preview.html',
  styleUrl: './customer-preview.css',
})
export class CustomerPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);
  private customer_service = inject(CustomerService);

  // contexto
  private readonly context = 'customer';

  // datos del cliente
  protected customer = signal<customer_preview_response | null>(null);
  private original_data = signal<customer_preview_response | null>(null);
  protected loading = signal<boolean>(false);
  protected saving = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // campos editables
  protected tax_id = signal<string>('');
  protected name = signal<string>('');
  protected phone = signal<string>('');
  protected email = signal<string>('');
  protected address = signal<string>('');

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Clientes'},
    {label: 'Vista Previa', active: true}
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);
  protected has_id = computed(() => !!this.route.snapshot.paramMap.get('id'));

  protected has_changes = computed(() => {
    const original = this.original_data();
    if (!original) return false;

    if (this.tax_id() !== (original.customer.tax_id ?? '')) return true;
    if (this.name() !== original.customer.name) return true;
    if (this.phone() !== (original.customer.phone ?? '')) return true;
    if (this.email() !== (original.customer.email ?? '')) return true;
    if (this.address() !== (original.customer.address ?? '')) return true;

    return false;
  });

  protected is_valid_form = computed(() => {
    return this.name().trim() !== '';
  });

  protected can_save = computed(() => this.has_changes() && this.is_valid_form() && !this.saving());

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_customer();
    }
  }

  // carga cliente desde api o servicio
  private load_customer(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.load_from_api(Number(id));
    } else {
      this.load_from_service();
    }
  }

  // carga cliente desde api
  private load_from_api(id: number): void {
    this.loading.set(true);
    this.error_message.set(null);

    this.customer_service.find_by_id(id).subscribe({
      next: (response) => {
        this.customer.set(response);
        this.original_data.set(structuredClone(response));
        this.populate_form(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error_message.set(err.error?.message ?? 'Error al cargar el cliente');
        this.loading.set(false);
      }
    });
  }

  // carga cliente desde servicio
  private load_from_service(): void {
    const last = this.context_form_service.get_last_customer(this.context);
    if (last) {
      this.customer.set(last);
      this.populate_form(last);
    } else {
      this.router.navigate(['/layout/customers/create']);
    }
  }

  // popula campos editables
  private populate_form(data: customer_preview_response): void {
    this.tax_id.set(data.customer.tax_id ?? '');
    this.name.set(data.customer.name ?? '');
    this.phone.set(data.customer.phone ?? '');
    this.email.set(data.customer.email ?? '');
    this.address.set(data.customer.address ?? '');
  }

  // descarta cambios
  protected on_discard(): void {
    const original = this.original_data();
    if (original) {
      this.populate_form(original);
    }
  }

  // guarda cambios via PUT
  protected on_save(): void {
    if (!this.can_save()) return;

    const id = this.customer()?.customer.id;
    if (!id) return;

    this.saving.set(true);

    const request = {
      tax_id: this.tax_id().trim() || null,
      name: this.name().trim(),
      phone: this.phone().trim() || null,
      email: this.email().trim() || null,
      address: this.address().trim() || null
    };

    this.customer_service.update(id, request).subscribe({
      next: (response) => {
        this.customer.set(response);
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

  // vuelve atras
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      const fallback = this.has_id() ? '/layout/customers/list' : '/layout/customers/create';
      this.router.navigate([fallback]);
    }
  }

  // formateo
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
