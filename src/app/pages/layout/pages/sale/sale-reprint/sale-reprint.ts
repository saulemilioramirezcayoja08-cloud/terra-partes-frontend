import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { SaleListResponse } from '../../../../../modules/sale/get/models/sale-list-response.model';

@Component({
  selector: 'app-sale-reprint',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './sale-reprint.html',
  styleUrl: './sale-reprint.css'
})
export class SaleReprint implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly saleData = signal<SaleListResponse | null>(null);

  readonly saleNumber = computed(() => this.saleData()?.number || 'N/A');
  readonly status = computed(() => this.saleData()?.status || 'BORRADOR');
  readonly customerName = computed(() => this.saleData()?.customer.name || '');
  readonly customerPhone = computed(() => this.saleData()?.customer.phone || '');
  readonly username = computed(() => this.saleData()?.user.username || '');
  readonly notes = computed(() => this.saleData()?.notes || 'Ninguna');
  readonly currency = computed(() => this.saleData()?.currency || 'BOB');

  readonly details = computed(() => {
    const data = this.saleData();
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
  readonly total = computed(() => this.saleData()?.totals.total || 0);
  readonly paymentAmount = computed(() => this.saleData()?.totals.payment || 0);
  readonly pendingAmount = computed(() => this.saleData()?.totals.pending || 0);

  readonly amountInWords = computed(() => {
    const total = this.total();
    const currency = this.currency();
    return currency === 'BOB'
      ? this.numberToWordsBob(total)
      : this.numberToWordsUsd(total);
  });

  readonly formattedDate = computed(() => {
    try {
      return new Date(this.saleData()?.createdAt || '').toLocaleDateString('es-BO');
    } catch {
      return new Date().toLocaleDateString('es-BO');
    }
  });

  readonly formattedDateTime = computed(() => {
    try {
      return new Date(this.saleData()?.createdAt || '').toLocaleString('es-BO');
    } catch {
      return new Date().toLocaleString('es-BO');
    }
  });

  readonly paymentName = computed(() => this.saleData()?.payment?.name || 'N/A');

  ngOnInit(): void {
    if (this.isBrowser) {
      const storedData = sessionStorage.getItem('sale-print-data');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          this.saleData.set(data);
          sessionStorage.removeItem('sale-print-data');
          return;
        } catch (error) {
          sessionStorage.removeItem('sale-print-data');
        }
      }
    }
    
    fetch('/assets/mock/sale.json')
      .then(r => r.json())
      .then(data => this.saleData.set(data))
      .catch(() => {});
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