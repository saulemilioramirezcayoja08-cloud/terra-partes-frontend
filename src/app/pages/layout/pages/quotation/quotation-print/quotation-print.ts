import {Component, computed, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {QuotationCartService} from '../../../../../modules/quotation/services/quotation-cart-service';
import {QuotationPreview} from '../../../../../modules/quotation/get/models/quotation-preview.model';
import {CreateQuotationResponse} from '../../../../../modules/quotation/post/models/create-quotation-response.model';

@Component({
  selector: 'app-quotation-print',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './quotation-print.html',
  styleUrl: './quotation-print.css'
})
export class QuotationPrint implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly quotationCartService = inject(QuotationCartService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly quotationData = signal<QuotationPreview | CreateQuotationResponse | null>(null);
  readonly mode = signal<'preview' | 'current'>('preview');

  readonly isPreview = computed(() => this.mode() === 'preview');

  readonly quotationNumber = computed(() => {
    const data = this.quotationData();
    if (!data) return 'N/A';
    return this.isPreview() ? 'BORRADOR' : (data as CreateQuotationResponse).number;
  });

  readonly status = computed(() => {
    const data = this.quotationData();
    if (!data) return 'BORRADOR';
    return this.isPreview() ? 'BORRADOR' : this.translateStatus((data as CreateQuotationResponse).status);
  });

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

    if (this.isPreview()) {
      const preview = data as QuotationPreview;
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
      const quotation = data as CreateQuotationResponse;
      return quotation.details.map((d: any, i: number) => ({
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
    const data = this.quotationData();
    if (!data) return 0;
    return this.isPreview()
      ? (data as QuotationPreview).totals.total
      : (data as CreateQuotationResponse).totals.total;
  });

  readonly amountInWords = computed(() => {
    const total = this.total();
    const currency = this.currency();
    return currency === 'BOB'
      ? this.numberToWordsBob(total)
      : this.numberToWordsUsd(total);
  });

  readonly currentDate = computed(() => {
    const data = this.quotationData();
    if (!data) return new Date();

    if (this.isPreview()) {
      return new Date();
    } else {
      const q = data as CreateQuotationResponse;
      return new Date(q.createdAt);
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

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'] || 'preview';
      this.mode.set(mode);

      if (mode === 'preview') {
        const preview = this.quotationCartService.getPreviewForPrint();
        this.quotationData.set(preview);
      } else {
        const current = this.quotationCartService.getCurrentQuotation();
        if (current) {
          this.quotationData.set(current);
        }
      }
    });
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'BORRADOR',
      CONFIRMED: 'CONFIRMADA',
      CANCELLED: 'CANCELADA'
    };
    return map[status] || status;
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
