import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {Router} from '@angular/router';
import {customer_create_response} from '../../models/response/customer-create-response.model';
import {isPlatformBrowser} from '@angular/common';
import {ContextFormService} from '../../../../../shared/services/context-form-service';

@Component({
  selector: 'app-customer-preview',
  imports: [Breadcrumb],
  templateUrl: './customer-preview.html',
  styleUrl: './customer-preview.css',
})
export class CustomerPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);

  // contexto
  private readonly context = 'customer';

  // datos del cliente
  protected customer = signal<customer_create_response | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Clientes'},
    {label: 'Vista Previa', active: true}
  ]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_customer();
    }
  }

  // carga cliente desde servicio
  private load_customer(): void {
    const last = this.context_form_service.get_last_customer(this.context);
    if (last) {
      this.customer.set(last);
    } else {
      this.router.navigate(['/layout/customers/create']);
    }
  }

  // vuelve atras
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/customers/create']);
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
