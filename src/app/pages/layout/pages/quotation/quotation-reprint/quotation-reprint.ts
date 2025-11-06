import {Component, computed, OnInit, signal} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {CreateQuotationResponse} from '../../../../../modules/quotation/post/models/create-quotation-response.model';

@Component({
  selector: 'app-quotation-reprint',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './quotation-reprint.html',
  styleUrl: './quotation-reprint.css'
})
export class QuotationReprint implements OnInit {
  readonly quotationData = signal<CreateQuotationResponse | null>(null);

  readonly quotationNumber = computed(() => this.quotationData()?.number || 'N/A');
  readonly status = computed(() => this.quotationData()?.status || 'BORRADOR');
  readonly customerName = computed(() => this.quotationData()?.customer.name || '');
  readonly customerAddress = computed(() => this.quotationData()?.customer.address || '');
  readonly customerPhone = computed(() => this.quotationData()?.customer.phone || '');
  readonly warehouseName = computed(() => this.quotationData()?.warehouse.name || '');
  readonly username = computed(() => this.quotationData()?.user.username || '');
  readonly notes = computed(() => this.quotationData()?.notes || 'Ninguna');
  readonly currency = computed(() => this.quotationData()?.currency || 'BOB');

  readonly details = computed(() => {
    const data = this.quotationData();
    if (!data) return [];
    return data.details.map((d: any, i: number) => ({
      item: i + 1,
      sku: d.product.sku,
      name: d.product.name,
      uom: '',
      quantity: d.quantity,
      price: d.price,
      subtotal: d.subtotal
    }));
  });

  readonly totalQuantity = computed(() =>
    this.details().reduce((sum, d) => sum + d.quantity, 0)
  );

  readonly total = computed(() => this.quotationData()?.totals.total || 0);

  readonly amountInWords = computed(() => {
    const total = this.total();
    const currency = this.currency();
    return currency === 'BOB'
      ? this.numberToWordsBob(total)
      : this.numberToWordsUsd(total);
  });

  readonly currentDate = computed(() => {
    const data = this.quotationData();
    return data ? new Date(data.createdAt) : new Date();
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

  ngOnInit(): void {
    fetch('/assets/mock/quotation.json')
      .then(r => r.json())
      .then(data => this.quotationData.set(data))
      .catch(() => console.error('No se pudo cargar quotation.json'));
  }

  private numberToWordsBob(num: number): string {
    if (num === 0) return 'CERO BOLIVIANOS';
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    let words = '';
    if (intPart >= 1_000_000) {
      const millions = Math.floor(intPart / 1_000_000);
      words += millions === 1 ? 'UN MILLÓN ' : this.convertGroup(millions) + ' MILLONES ';
    }
    const thousands = Math.floor((intPart % 1_000_000) / 1000);
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
    const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS'];
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
