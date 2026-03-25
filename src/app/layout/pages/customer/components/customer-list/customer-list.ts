import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { Paginator } from '../../../../../shared/components/paginator/paginator';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer-service';
import { customer_search_response } from '../../models/response/customer-search-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-customer-list',
  imports: [Breadcrumb, Paginator, FormsModule],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList implements OnInit {
  // dependencias
  private router = inject(Router);
  private customer_service = inject(CustomerService);
  private platform_id = inject(PLATFORM_ID);

  // datos
  protected data = signal<customer_search_response[]>([]);
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
    {label: 'Clientes'},
    {label: 'Listado', active: true}
  ]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_customers();
    }
  }

  // carga clientes con filtros y paginacion
  private load_customers(): void {
    this.loading.set(true);

    this.customer_service.search(
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
    this.load_customers();
  }

  // cambio de pagina
  protected on_page_change(page: number): void {
    this.current_page.set(page);
    this.load_customers();
  }

  // navega a preview
  protected on_customer_click(id: number): void {
    this.router.navigate(['/layout/customers/preview', id]);
  }
}