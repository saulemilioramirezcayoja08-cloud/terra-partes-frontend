export interface CreateQuotationRequest {
  customerId: number;
  warehouseId: number;
  userId: number;
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
