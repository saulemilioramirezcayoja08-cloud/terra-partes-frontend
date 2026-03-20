import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order-service';
import { order_payment_list_response } from '../../models/response/order-payment-list-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-order-complete',
  imports: [Breadcrumb],
  templateUrl: './order-complete.html',
  styleUrl: './order-complete.css',
})
export class OrderComplete implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private order_service = inject(OrderService);

  // datos
  protected data = signal<order_payment_list_response | null>(null);
  protected loading = signal<boolean>(false);
  protected completing = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Órdenes' },
    { label: 'Completar', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  protected is_pending = computed(() => this.data()?.order.status === 'PENDING');

  protected can_complete = computed(() => this.is_pending() && !this.completing());

  protected status_label = computed(() => {
    const status = this.data()?.order.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected status_class = computed(() => {
    return this.data()?.order.status?.toLowerCase() ?? 'pending';
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_order();
    }
  }

  // carga datos de la orden
  private load_order(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/layout/orders/list']);
      return;
    }

    this.loading.set(true);
    this.error_message.set(null);

    this.order_service.get_payments(Number(id)).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error_message.set(err.error?.message ?? 'Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  // completa la orden
  protected complete_order(): void {
    if (!this.can_complete()) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.completing.set(true);

    this.order_service.complete(Number(id)).subscribe({
      next: () => {
        this.completing.set(false);
        this.router.navigate(['/layout/orders/preview', id], { replaceUrl: true });
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
      this.router.navigate(['/layout/orders/list']);
    }
  }
}
