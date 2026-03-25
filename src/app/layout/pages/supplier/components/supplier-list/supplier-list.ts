import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { Paginator } from '../../../../../shared/components/paginator/paginator';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../services/supplier-service';
import { supplier_search_response } from '../../models/response/supplier-search-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-supplier-list',
  imports: [Breadcrumb, Paginator, FormsModule],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css',
})
export class SupplierList implements OnInit {
  // dependencias
  private router = inject(Router);
  private supplier_service = inject(SupplierService);
  private platform_id = inject(PLATFORM_ID);

  // datos
  protected data = signal<supplier_search_response[]>([]);
  protected loading = signal<boolean>(false);
  protected total_items = signal<number>(0);

  // paginacion
  protected current_page = signal<number>(1);
  protected page_size = signal<number>(10);

  // filtros
  protected filter_name = signal<string>('');
  protected filter_email = signal<string>('');
  protected filter_tax_id = signal<string>('');

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Proveedores'},
    {label: 'Listado', active: true}
  ]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_suppliers();
    }
  }

  // carga proveedores con filtros y paginacion
  private load_suppliers(): void {
    this.loading.set(true);

    this.supplier_service.search(
      this.current_page(),
      this.page_size(),
      this.filter_name(),
      this.filter_email(),
      this.filter_tax_id()
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

  // cambio en filtros
  protected on_filter_change(): void {
    this.current_page.set(1);
    this.load_suppliers();
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_suppliers();
  }

  // navega a preview
  protected on_supplier_click(id: number): void {
    this.router.navigate(['/layout/suppliers/preview', id]);
  }
}
