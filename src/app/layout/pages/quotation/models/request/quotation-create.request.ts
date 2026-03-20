export interface quotation_create_request {
  user_id: number;
  customer_id: number;
  warehouse_id: number;
  currency: string;
  notes: string | null;
  items: {
    product_id: number;
    quantity: number;
    price: number;
    notes: string | null;
  }[];
}