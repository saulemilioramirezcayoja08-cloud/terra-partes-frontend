import { Component, inject, Inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from '../../services/sale-service';
import { sale_profit_traceability_response } from '../../models/response/sale-profit-traceability-response.model';

@Component({
  selector: 'app-sale-profit-traceability',
  imports: [Breadcrumb, DatePipe],
  templateUrl: './sale-profit-traceability.html',
  styleUrl: './sale-profit-traceability.css',
})
export class SaleProfitTraceability implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private sale_service = inject(SaleService);

  // datos
  protected data = signal<sale_profit_traceability_response | null>(null);
  protected loading = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // estado de expandidos
  protected expanded_items = signal<Set<number>>(new Set());

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Ventas' },
    { label: 'Rentabilidad' },
    { label: 'Trazabilidad', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  protected total_revenue = computed(() => {
    return this.data()?.items.reduce((sum, i) => sum + i.revenue, 0) ?? 0;
  });

  protected total_cost = computed(() => {
    return this.data()?.items.reduce((sum, i) => sum + i.cost, 0) ?? 0;
  });

  protected total_margin = computed(() => {
    return this.data()?.items.reduce((sum, i) => sum + i.margin, 0) ?? 0;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_data();
    }
  }

  // carga trazabilidad
  private load_data(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/layout/sales/profit']);
      return;
    }

    this.loading.set(true);
    this.error_message.set(null);

    this.sale_service.get_profit_traceability(Number(id)).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err.error);
        this.error_message.set(err.error?.message ?? 'Error al cargar la trazabilidad');
        this.loading.set(false);
      }
    });
  }

  // toggle expandir/colapsar item
  protected toggle_expand(product_id: number): void {
    const current = new Set(this.expanded_items());
    if (current.has(product_id)) {
      current.delete(product_id);
    } else {
      current.add(product_id);
    }
    this.expanded_items.set(current);
  }

  // verifica si un item esta expandido
  protected is_expanded(product_id: number): boolean {
    return this.expanded_items().has(product_id);
  }

  // vuelve atras
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/sales/profit']);
    }
  }

  // navega a vista previa de compra
  protected go_to_purchase(purchase_id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/layout/purchases/preview', purchase_id]);
  }

  // calcula porcentaje de margen
  protected get_margin_percent(margin: number, revenue: number): number {
    if (revenue === 0) return 0;
    return (margin / revenue) * 100;
  }

  // clase css segun margen
  protected get_margin_class(margin: number, revenue: number): string {
    const percent = this.get_margin_percent(margin, revenue);
    if (percent >= 20) return 'success';
    if (percent >= 0) return 'warning';
    return 'danger';
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}