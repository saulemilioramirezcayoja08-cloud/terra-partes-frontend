export interface DetailRequest {
  productId: number;
  quantity: number;
  price: number;
  notes?: string;
}

export interface PaymentRequest {
  amount: number;
  userId?: number;
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
