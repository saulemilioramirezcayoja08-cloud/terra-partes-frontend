export interface ConfirmPurchaseResponse {
  id: number;
  number: string;
  status: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  warehouse: Warehouse;
  payment: Payment | null;
  user: User;
  details: Detail[];
  totals: Totals;
}

export interface Supplier {
  id: number;
  name: string;
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
