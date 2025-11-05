export interface CreateSalePaymentResponse {
  id: number;
  amount: number;
  createdAt: string;
  user: User;
  sale: Sale;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Sale {
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
