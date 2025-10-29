export interface DetailRequest {
  productId: number;
  quantity: number;
  price: number;
}

export interface PaymentRequest {
  paymentId: number;
  amount: number;
  notes?: string;
}

export interface CreateOrderRequest {
  customerId: number;
  warehouseId: number;
  paymentId: number;
  currency: string;
  notes?: string;
  userId?: number;
  quotationId?: number;
  details: DetailRequest[];
  payments?: PaymentRequest[];
}
