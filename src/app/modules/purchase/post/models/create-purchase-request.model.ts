export interface CreatePurchaseRequest {
  supplierId: number;
  warehouseId: number;
  userId: number;
  paymentId?: number;
  currency: string;
  notes?: string;
  details: Detail[];
}

export interface Detail {
  productId: number;
  quantity: number;
  price: number;
  notes?: string;
}
