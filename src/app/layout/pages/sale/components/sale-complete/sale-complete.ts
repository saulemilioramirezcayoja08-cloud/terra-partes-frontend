import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from '../../services/sale-service';
import { isPlatformBrowser } from '@angular/common';
import {sale_completion_preview_response} from '../../models/response/sale-completion-preview-response.model';

@Component({
  selector: 'app-sale-complete',
  imports: [Breadcrumb],
  templateUrl: './sale-complete.html',
  styleUrl: './sale-complete.css',
})
export class SaleComplete implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private sale_service = inject(SaleService);

  // datos
  protected data = signal<sale_completion_preview_response | null>(null);
  protected loading = signal<boolean>(false);
  protected completing = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    {label: 'Ventas'},
    {label: 'Completar', active: true}
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  protected is_pending = computed(() => this.data()?.sale.status === 'PENDING');

  protected can_complete = computed(() => this.is_pending() && !this.completing());

  protected status_label = computed(() => {
    const status = this.data()?.sale.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected status_class = computed(() => {
    return this.data()?.sale.status?.toLowerCase() ?? 'pending';
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_preview();
    }
  }

  // carga preview de completar venta
  private load_preview(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/layout/sales/list']);
      return;
    }

    this.loading.set(true);
    this.error_message.set(null);

    this.sale_service.get_completion_preview(Number(id)).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error_message.set(err.error?.message ?? 'Error al cargar la venta');
        this.loading.set(false);
      }
    });
  }

  // completa la venta
  protected complete_sale(): void {
    if (!this.can_complete()) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.completing.set(true);

    this.sale_service.complete(Number(id)).subscribe({
      next: () => {
        this.completing.set(false);
        this.router.navigate(['/layout/sales/preview', id], {replaceUrl: true});
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.completing.set(false);
      }
    });
  }

  // vuelve atras
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/sales/list']);
    }
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }
}
