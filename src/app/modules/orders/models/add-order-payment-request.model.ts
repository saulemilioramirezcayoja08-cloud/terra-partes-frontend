export interface AddOrderPaymentRequest {
  paymentId: number;
  amount: number;
  notes?: string;
  userId?: number;
}
