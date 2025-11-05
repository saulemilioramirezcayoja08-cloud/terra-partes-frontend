export interface CreateOrderRequest {
  customerId: number;
  warehouseId: number;
  quotationId?: number;
  userId: number;
  paymentId?: number;
  currency: string;
  notes?: string;
  details: Detail[];
  payment?: Payment;
}

export interface Detail {
  productId: number;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Payment {
  amount: number;
}
