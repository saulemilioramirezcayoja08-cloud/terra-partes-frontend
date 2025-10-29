import { OrderPaymentInfo } from './create-order-response.model';

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
}
