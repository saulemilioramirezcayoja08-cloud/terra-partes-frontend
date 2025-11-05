export interface CreateOrderPaymentResponse {
  id: number;
  amount: number;
  createdAt: string;
  user: User;
  order: Order;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  totals: Totals;
}

export interface Totals {
  total: number;
  payment: number;
  pending: number;
}
