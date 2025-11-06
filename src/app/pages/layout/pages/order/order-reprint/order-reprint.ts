import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {CreateOrderResponse} from '../../../../../modules/order/post/models/create-order-response.model';

@Component({
  selector: 'app-order-reprint',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './order-reprint.html',
  styleUrl: './order-reprint.css'
})
export class OrderReprint implements OnInit {
  readonly orderData = signal<CreateOrderResponse | null>(null);

  readonly orderNumber = computed(() => this.orderData()?.number || 'N/A');
  readonly status = computed(() => this.orderData()?.status || 'DRAFT');
  readonly customerName = computed(() => this.orderData()?.customer.name || '');
  readonly customerPhone = computed(() => this.orderData()?.customer.phone || '');
  readonly username = computed(() => this.orderData()?.user.username || '');
  readonly notes = computed(() => this.orderData()?.notes || 'Ninguna');
  readonly currency = computed(() => this.orderData()?.currency || 'BOB');

  readonly details = computed(() => {
    const data = this.orderData();
    if (!data) return [];
    return data.details.map((d, i) => ({
      item: i + 1,
      sku: d.product.sku,
      name: d.product.name,
      uom: '',
      quantity: d.quantity,
      price: d.price,
      subtotal: d.subtotal
    }));
  });

  readonly totalQuantity = computed(() => this.details().reduce((sum, d) => sum + d.quantity, 0));
  readonly total = computed(() => this.orderData()?.totals.total || 0);
  readonly paymentAmount = computed(() => this.orderData()?.totals.payment || 0);
  readonly pendingAmount = computed(() => this.orderData()?.totals.pending || 0);

  readonly amountInWords = computed(() => {
    const total = this.total();
    const currency = this.currency();
    return currency === 'BOB'
      ? this.numberToWordsBob(total)
      : this.numberToWordsUsd(total);
  });

  readonly formattedDate = computed(() => {
    try {
      return new Date(this.orderData()?.createdAt || '').toLocaleDateString('es-BO');
    } catch {
      return new Date().toLocaleDateString('es-BO');
    }
  });

  readonly formattedDateTime = computed(() => {
    try {
      return new Date(this.orderData()?.createdAt || '').toLocaleString('es-BO');
    } catch {
      return new Date().toLocaleString('es-BO');
    }
  });

  readonly paymentName = computed(() => this.orderData()?.payment?.name || 'N/A');

  ngOnInit(): void {
    fetch('/assets/mock/order.json')
      .then(r => r.json())
      .then(data => this.orderData.set(data))
      .catch(() => console.error('No se pudo cargar order.json'));
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
    if (thousands > 0) words += thousands === 1 ? 'MIL ' : this.convertGroup(thousands) + ' MIL ';
    const remainder = intPart % 1000;
    if (remainder > 0) words += this.convertGroup(remainder);
    words = words.trim() + ' BOLIVIANOS';
    if (decPart > 0) words += ' CON ' + decPart.toString().padStart(2, '0') + '/100';
    return words;
  }

  private convertGroup(num: number): string {
    const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS'];
    let words = '';
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;
    if (h > 0) {
      words += h === 1 && t === 0 && u === 0 ? 'CIEN' : hundreds[h];
      if (t > 0 || u > 0) words += ' ';
    }
    if (t === 1) words += teens[u];
    else {
      if (t > 0) {
        words += tens[t];
        if (u > 0) words += ' Y ';
      }
      if (u > 0) words += units[u];
    }
    return words.trim();
  }

  private numberToWordsUsd(num: number): string {
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    let words = intPart.toFixed(0) + ' DÓLARES';
    if (decPart > 0) words += ' CON ' + decPart.toString().padStart(2, '0') + '/100';
    return words;
  }

  trackByItem(index: number, item: any): number {
    return item.item;
  }
}
