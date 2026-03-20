export interface order_create_request {
  user_id: number;
  customer_id: number;
  warehouse_id: number;
  currency: string;
  payment_method_id: number;
  quotation_id: number | null;
  notes: string | null;
  payment: {
    amount: number;
  } | null;
  items: {
    product_id: number;
    quantity: number;
    price: number;
    notes: string | null;
  }[];
}
