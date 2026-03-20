import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {Router} from '@angular/router';
import {supplier_create_response} from '../../models/response/supplier-create-response.model';
import {isPlatformBrowser} from '@angular/common';
import {ContextFormService} from '../../../../../shared/services/context-form-service';

@Component({
  selector: 'app-supplier-preview',
  imports: [Breadcrumb],
  templateUrl: './supplier-preview.html',
  styleUrl: './supplier-preview.css',
})
export class SupplierPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);

  // contexto
  private readonly context = 'supplier';

  // datos del proveedor
  protected supplier = signal<supplier_create_response | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Proveedores'},
    {label: 'Vista Previa', active: true}
  ]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_supplier();
    }
  }

  // carga proveedor desde servicio
  private load_supplier(): void {
    const last = this.context_form_service.get_last_supplier(this.context);
    if (last) {
      this.supplier.set(last);
    } else {
      this.router.navigate(['/layout/suppliers/create']);
    }
  }

  // vuelve atras
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/suppliers/create']);
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
