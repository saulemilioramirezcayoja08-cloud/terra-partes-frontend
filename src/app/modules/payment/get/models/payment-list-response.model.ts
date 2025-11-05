export interface PaymentListResponse {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  activity: Activity;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Activity {
  purchases: number;
  purchasesTotal: number;
  orders: number;
  ordersTotal: number;
  sales: number;
  salesTotal: number;
}
