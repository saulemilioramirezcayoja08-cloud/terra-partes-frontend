export interface OrderListResponse {
  id: number;
  number: string;
  status: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  customer: Customer;
  warehouse: Warehouse;
  payment: Payment;
  quotation: Quotation;
  user: User;

  details: Detail[];
  totals: Totals;
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  taxId: string;
  phone: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
}

export interface Payment {
  id: number;
  code: string;
  name: string;
}

export interface Quotation {
  id: number;
  number: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Detail {
  id: number;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  product: Product;
  reservation: Reservation;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
}

export interface Reservation {
  id: number;
  status: string;
}

export interface Totals {
  total: number;
  payment: number;
  pending: number;
  items: number;
}
