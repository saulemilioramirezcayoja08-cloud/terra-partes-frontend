import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {Breadcrumb, breadcrumb_item} from '../../../../../shared/components/breadcrumb/breadcrumb';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PurchaseService} from '../../services/purchase-service';
import {purchase_payment_list_response} from '../../models/response/purchase-payment-list-response.model';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-purchase-payment',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './purchase-payment.html',
  styleUrl: './purchase-payment.css',
})
export class PurchasePayment implements OnInit {
  // dependencias
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform_id = inject(PLATFORM_ID);
  private purchase_service = inject(PurchaseService);

  // datos
  protected data = signal<purchase_payment_list_response | null>(null);
  protected loading = signal<boolean>(false);
  protected saving = signal<boolean>(false);
  protected error_message = signal<string | null>(null);

  // formulario
  protected payment_amount = signal<number>(0);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Compras' },
    { label: 'Pagos', active: true }
  ]);

  // computados
  protected has_error = computed(() => this.error_message() !== null);

  // muestra el formulario si la compra esta pendiente o completada
  protected can_show_payment_form = computed(() => {
    const status = this.data()?.purchase.status ?? '';
    return status === 'PENDING' || status === 'COMPLETED';
  });

  // habilita el boton agregar
  protected can_add_payment = computed(() =>
    this.payment_amount() > 0 && !this.saving() && this.can_show_payment_form()
  );

  protected status_label = computed(() => {
    const status = this.data()?.purchase.status;
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VOIDED': 'Anulado'
    };
    return labels[status ?? ''] ?? status ?? '';
  });

  protected status_class = computed(() => {
    const status = this.data()?.purchase.status?.toLowerCase();
    return status ?? 'pending';
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_payments();
    }
  }

  // carga pagos de la compra
  private load_payments(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/layout/purchases/list']);
      return;
    }

    this.loading.set(true);
    this.error_message.set(null);

    this.purchase_service.get_payments(Number(id)).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error_message.set(err.error?.message ?? 'Error al cargar los pagos');
        this.loading.set(false);
      }
    });
  }

  // agrega pago a la compra
  protected add_payment(): void {
    if (!this.can_add_payment()) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.saving.set(true);

    this.purchase_service.add_payment(Number(id), { amount: this.payment_amount() }).subscribe({
      next: (response) => {
        const current = this.data();
        if (current) {
          const new_payment = {
            id: response.id,
            amount: response.amount,
            user_name: response.user_name,
            created_at: response.created_at
          };

          // recalcula totales para evitar acumulacion de punto flotante
          const new_paid = current.totals.paid + response.amount;
          const new_pending = current.totals.total - new_paid;

          this.data.set({
            ...current,
            payments: [...current.payments, new_payment],
            totals: {
              ...current.totals,
              paid: new_paid,
              pending: new_pending
            }
          });
        }

        this.payment_amount.set(0);
        this.saving.set(false);
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.saving.set(false);
      }
    });
  }

  // vuelve atras usando historial del navegador
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/purchases/list']);
    }
  }

  // formateo
  protected format_number(amount: number): string {
    return amount.toFixed(2);
  }

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
