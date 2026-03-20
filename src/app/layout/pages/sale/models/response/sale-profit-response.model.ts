export interface sale_profit_response {
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
  }[];
}