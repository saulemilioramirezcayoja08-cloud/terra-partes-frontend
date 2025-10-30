export interface OrderPaymentInfo {
  id: number;
  amount: number;
  createdAt: string;
  username: string | null;
}

export interface TotalsInfo {
  orderTotal: number;
  totalPayments: number;
  pendingAmount: number;
}

export interface AddOrderPaymentResponse {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  payment: OrderPaymentInfo;
  totals: TotalsInfo;
  canConfirm: boolean;
  message: string;
}
