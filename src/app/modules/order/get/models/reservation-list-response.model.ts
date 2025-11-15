export interface ReservationListResponse {
  id: number;
  status: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  order: Order;
  product: Product;
  warehouse: Warehouse;
  user: User | null;
}

export interface Order {
  id: number;
  number: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
}