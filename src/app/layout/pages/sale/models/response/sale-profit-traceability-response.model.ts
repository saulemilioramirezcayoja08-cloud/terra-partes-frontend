export interface sale_profit_traceability_response {
  sale: {
    id: number;
    number: string;
    currency: string;
    created_at: string;
  };
  customer: {
    id: number;
    name: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  items: {
    product_id: number;
    product_sku: string;
    product_name: string;
    product_origin: string;
    quantity: number;
    sale_price: number;
    revenue: number;
    cost: number;
    margin: number;
    movements: {
      purchase_id: number;
      purchase_number: string;
      purchase_price: number;
      quantity: number;
      subtotal: number;
    }[];
  }[];
}