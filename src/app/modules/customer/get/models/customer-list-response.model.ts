export interface CustomerListResponse {
  id: number;
  taxId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
  sales: Sale[];
}

export interface Order {
  id: number;
  number: string;
  status: string;
  currency: string;
  createdAt: string;
  totals: Totals;
  hasSale: boolean;
  saleId: number | null;
}

export interface Sale {
  id: number;
  number: string;
  status: string;
  currency: string;
  createdAt: string;
  orderId: number;
  orderNumber: string;
  totals: Totals;
}

export interface Totals {
  total: number;
  payment: number;
  pending: number;
  items: number;
}
