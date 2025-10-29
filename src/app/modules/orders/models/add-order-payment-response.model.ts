export interface OrderPaymentInfo {
  id: number;
  amount: number;
  createdAt: string;
  username: string;
}

export interface TotalsInfo {
  total: number;
  totalPayments: number;
  pendingAmount: number;
}

export interface AddOrderPaymentResponse {
  orderId: number;
  orderNumber: string;
  payment: OrderPaymentInfo;
  totals: TotalsInfo;
  canConfirm: boolean;
  message: string;
}
