import {Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderCartService} from '../../../../../modules/orders/services/order-cart-service';

interface Product {
  itemNumber: string;
  sku: string;
  name: string;
  origin: string;
  quantity: number;
  price: number;
  total: number;
}

interface Customer {
  name: string;
  address: string;
  phone: string;
}

interface OrderData {
  orderNumber: string;
  date: string;
  status: string;
  currency: string;
  customer: Customer;
  seller: string;
  warehouse: string;
  paymentMethod: string;
  products: Product[];
  totals: {
    totalQuantity: number;
    grandTotal: number;
    totalPayments: number;
    pendingAmount: number;
    amountInWords: string;
  };
  notes: string;
  registrationDateTime: string;
  username: string;
}

@Component({
  selector: 'app-order-print',
  imports: [CommonModule],
  templateUrl: './order-print.html',
  styleUrl: './order-print.css'
})
export class OrderPrint {
  private orderCartService = inject(OrderCartService);

  orderData = computed<OrderData>(() => {
    const cartItems = this.orderCartService.cartItems();
    const total = this.orderCartService.total();
    const advance = this.orderCartService.advance();
    const pending = this.orderCartService.pendingAmount();
    const notes = this.orderCartService.notes();

    const products: Product[] = cartItems.map((item, index) => ({
      itemNumber: String(index + 1).padStart(2, '0'),
      sku: item.sku,
      name: item.name,
      origin: 'OR',
      quantity: item.quantity,
      price: item.price,
      total: item.subtotal
    }));

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      orderNumber: 'PREVIEW',
      date: new Date().toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      status: 'BORRADOR',
      currency: 'BOB',
      customer: {
        name: 'SIN CLIENTE ASIGNADO',
        address: '-',
        phone: '-'
      },
      seller: 'SIN ASIGNAR',
      warehouse: 'SIN ALMACÉN ASIGNADO',
      paymentMethod: 'SIN MÉTODO DE PAGO',
      products: products,
      totals: {
        totalQuantity: totalQuantity,
        grandTotal: total,
        totalPayments: advance,
        pendingAmount: pending,
        amountInWords: this.numberToWords(total)
      },
      notes: notes || 'N/A',
      registrationDateTime: new Date().toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      username: 'usuario.preview'
    };
  });

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  formatCurrency(value: number): string {
    return `Bs. ${value.toFixed(2)}`;
  }

  formatQuantity(value: number): string {
    return value.toString();
  }

  printDocument(): void {
    window.print();
  }

  private numberToWords(num: number): string {
    if (num === 0) return 'CERO BOLIVIANOS 00/100';

    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    const convertirGrupo = (n: number): string => {
      if (n === 0) return '';
      if (n === 100) return 'CIEN';

      let resultado = '';

      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;

      if (c > 0) resultado += centenas[c] + ' ';

      if (d === 1) {
        resultado += especiales[u];
      } else {
        if (d > 0) resultado += decenas[d];
        if (d > 1 && u > 0) resultado += ' Y ';
        if (u > 0 && d !== 1) resultado += unidades[u];
      }

      return resultado.trim();
    };

    let entero = Math.floor(num);
    const decimales = Math.round((num - Math.floor(num)) * 100);

    let palabras = '';

    if (entero >= 1000000) {
      const millones = Math.floor(entero / 1000000);
      palabras += convertirGrupo(millones) + (millones === 1 ? ' MILLÓN ' : ' MILLONES ');
      entero %= 1000000;
    }

    if (entero >= 1000) {
      const miles = Math.floor(entero / 1000);
      if (miles === 1) {
        palabras += 'MIL ';
      } else {
        palabras += convertirGrupo(miles) + ' MIL ';
      }
      entero %= 1000;
    }

    if (entero > 0) {
      palabras += convertirGrupo(entero);
    }

    return `${palabras.trim()} BOLIVIANOS ${decimales.toString().padStart(2, '0')}/100`;
  }
}
