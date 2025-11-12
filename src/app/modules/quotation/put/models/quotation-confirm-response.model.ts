export interface QuotationConfirmResponse {
  // Información de la Cotización confirmada
  quotation: Quotation;

  // Información de la Orden creada
  order: Order;

  // Información de las Reservas creadas
  reservations: Reservation[];
}

export interface Quotation {
  id: number;
  number: string;
  status: string;
  notes?: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  customer: Customer;
  warehouse: Warehouse;
  payment: Payment | null;
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
}

export interface Product {
  id: number;
  sku: string;
  name: string;
}

export interface Totals {
  total: number;
  items: number;
}

export interface Reservation {
  id: number;
  status: string;
  quantity: number;
  notes?: string;
  product: Product;
  warehouse: Warehouse;
  createdAt: string;
}