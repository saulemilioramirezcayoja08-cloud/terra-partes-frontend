export interface CreatePurchasePaymentResponse {
  id: number;
  amount: number;
  createdAt: string;
  user: User;
  purchase: Purchase;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Purchase {
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