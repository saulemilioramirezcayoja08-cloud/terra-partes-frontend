import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {OrderPreview} from '../../../../../modules/order/get/models/order-preview.model';
import {CreateOrderResponse} from '../../../../../modules/order/post/models/create-order-response.model';
import {OrderCartService} from '../../../../../modules/order/services/order-cart-service';

@Component({
  selector: 'app-order-print',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './order-print.html',
  styleUrl: './order-print.css'
})
export class OrderPrint implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly orderCartService = inject(OrderCartService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly orderData = signal<OrderPreview | CreateOrderResponse | null>(null);
  readonly mode = signal<'preview' | 'current'>('preview');

  readonly isPreview = computed(() => this.mode() === 'preview');

  readonly orderNumber = computed(() => {
    const data = this.orderData();
    if (!data) return 'N/A';
    return this.isPreview() ? 'BORRADOR' : (data as CreateOrderResponse).number;
  });

  readonly status = computed(() => {
    const data = this.orderData();
    if (!data) return 'BORRADOR';
    return this.isPreview() ? 'BORRADOR' : this.translateStatus((data as CreateOrderResponse).status);
  });

  readonly customerName = computed(() => this.orderData()?.customer.name || '');
  readonly customerAddress = computed(() => this.orderData()?.customer.address || '');
  readonly customerPhone = computed(() => this.orderData()?.customer.phone || '');
  readonly warehouseName = computed(() => this.orderData()?.warehouse.name || '');
  readonly username = computed(() => this.orderData()?.user.username || '');
  readonly notes = computed(() => this.orderData()?.notes || 'Ninguna');
  readonly currency = computed(() => this.orderData()?.currency || 'BOB');

  readonly details = computed(() => {
    const data = this.orderData();
    if (!data) return [];

    if (this.isPreview()) {
      const preview = data as OrderPreview;
      return preview.details.map((d, i) => ({
        item: i + 1,
        sku: d.sku,
        name: d.editableName || d.name,
        uom: d.uom,
        quantity: d.quantity,
        price: d.price,
        subtotal: d.subtotal
      }));
    } else {
      const order = data as CreateOrderResponse;
      return order.details.map((d, i) => ({
        item: i + 1,
        sku: d.product.sku,
        name: d.product.name,
        uom: '',
        quantity: d.quantity,
        price: d.price,
        subtotal: d.subtotal
      }));
    }
  });

  readonly totalQuantity = computed(() =>
    this.details().reduce((sum, d) => sum + d.quantity, 0)
  );

  readonly total = computed(() => {
    const data = this.orderData();
    if (!data) return 0;
    return this.isPreview()
      ? (data as OrderPreview).totals.total
      : (data as CreateOrderResponse).totals.total;
  });

  readonly paymentAmount = computed(() => {
    const data = this.orderData();
    if (!data) return 0;
    return this.isPreview()
      ? (data as OrderPreview).totals.payment
      : (data as CreateOrderResponse).totals.payment;
  });

  readonly pendingAmount = computed(() => {
    const data = this.orderData();
    if (!data) return 0;
    return this.isPreview()
      ? (data as OrderPreview).totals.pending
      : (data as CreateOrderResponse).totals.pending;
  });

  readonly amountInWords = computed(() => {
    const total = this.total();
    const currency = this.currency();
    return currency === 'BOB'
      ? this.numberToWordsBob(total)
      : this.numberToWordsUsd(total);
  });

  readonly currentDate = computed(() => {
    const data = this.orderData();
    if (!data) return new Date();

    if (this.isPreview()) {
      return new Date();
    } else {
      const order = data as CreateOrderResponse;
      return new Date(order.createdAt);
    }
  });

  readonly formattedDate = computed(() => {
    try {
      return this.currentDate().toLocaleDateString('es-BO');
    } catch {
      return new Date().toLocaleDateString('es-BO');
    }
  });

  readonly formattedDateTime = computed(() => {
    try {
      return this.currentDate().toLocaleString('es-BO');
    } catch {
      return new Date().toLocaleString('es-BO');
    }
  });

  readonly paymentName = computed(() => {
    const data = this.orderData();
    if (!data) return 'N/A';

    try {
      if (this.isPreview()) {
        return (data as OrderPreview).payment?.name || 'N/A';
      } else {
        return (data as CreateOrderResponse).payment?.name || 'N/A';
      }
    } catch {
      return 'N/A';
    }
  });

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'] || 'preview';
      this.mode.set(mode);

      if (mode === 'preview') {
        const preview = this.orderCartService.getPreviewForPrint();
        this.orderData.set(preview);
      } else {
        const current = this.orderCartService.getCurrentOrder();
        if (current) {
          this.orderData.set(current);
        }
      }
    });
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'DRAFT': 'BORRADOR',
      'CONFIRMED': 'CONFIRMADA',
      'CANCELLED': 'CANCELADA'
    };
    return statusMap[status] || status;
  }

  private numberToWordsBob(num: number): string {
    if (num === 0) return 'CERO BOLIVIANOS';

    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);

    let words = '';

    if (intPart >= 1000000) {
      const millions = Math.floor(intPart / 1000000);
      words += millions === 1 ? 'UN MILLÓN ' : this.convertGroup(millions) + ' MILLONES ';
    }

    const thousands = Math.floor((intPart % 1000000) / 1000);
    if (thousands > 0) {
      words += thousands === 1 ? 'MIL ' : this.convertGroup(thousands) + ' MIL ';
    }

    const remainder = intPart % 1000;
    if (remainder > 0) {
      words += this.convertGroup(remainder);
    }

    words = words.trim() + ' BOLIVIANOS';

    if (decPart > 0) {
      words += ' CON ' + decPart.toString().padStart(2, '0') + '/100';
    }

    return words;
  }

  private convertGroup(num: number): string {
    const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    let words = '';

    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (h > 0) {
      words += h === 1 && t === 0 && u === 0 ? 'CIEN' : hundreds[h];
      if (t > 0 || u > 0) words += ' ';
    }

    if (t === 1) {
      words += teens[u];
    } else {
      if (t > 0) {
        words += tens[t];
        if (u > 0) words += ' Y ';
      }
      if (u > 0) {
        words += units[u];
      }
    }

    return words.trim();
  }

  private numberToWordsUsd(num: number): string {
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    let words = intPart.toFixed(0) + ' DÓLARES';
    if (decPart > 0) {
      words += ' CON ' + decPart.toString().padStart(2, '0') + '/100';
    }
    return words;
  }

  trackByItem(index: number, item: any): number {
    return item.item;
  }
}
