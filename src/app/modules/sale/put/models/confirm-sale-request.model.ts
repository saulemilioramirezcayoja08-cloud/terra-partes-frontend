export interface ConfirmSaleRequest {
  notes?: string;
  productCommissionRates?: { [productId: number]: number };
}