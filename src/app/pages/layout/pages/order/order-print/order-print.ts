import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';

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
  orderData: OrderData = {
    orderNumber: '4',
    date: '28/10/2025',
    status: 'CONFIRMADA',
    currency: 'BOB',
    customer: {
      name: 'Juan Pérez García',
      address: 'Zona Central',
      phone: '(591) 555-1001'
    },
    seller: 'emilio.ramirez',
    warehouse: 'Almacén Central',
    paymentMethod: 'Efectivo',
    products: [
      {
        itemNumber: '01',
        sku: '0001',
        name: 'PASADOR PISTON F8D ALTO 10- 3CIL',
        origin: 'JPN',
        quantity: 5,
        price: 45.50,
        total: 227.50
      },
      {
        itemNumber: '02',
        sku: '0002',
        name: 'COJ LEVA K14B/K15B JIMMY 22- BALENO 16-',
        origin: 'JPN',
        quantity: 3,
        price: 85.00,
        total: 255.00
      }
    ],
    totals: {
      totalQuantity: 8,
      grandTotal: 482.50,
      totalPayments: 200.00,
      pendingAmount: 282.50,
      amountInWords: 'CUATROCIENTOS OCHENTA Y DOS CON 50/100 BOLIVIANOS'
    },
    notes: 'Pedido urgente',
    registrationDateTime: '28/10/2025 15:14:35',
    username: 'emilio.ramirez'
  };

  // Para la tabla (sin "Bs.")
  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  // Solo para totales y sección de pago (con "Bs.")
  formatCurrency(value: number): string {
    return `Bs. ${value.toFixed(2)}`;
  }

  formatQuantity(value: number): string {
    return value.toString();
  }

  printDocument(): void {
    window.print();
  }
}
