export interface purchase_create_request {
  user_id: number;
  supplier_id: number;
  warehouse_id: number;
  currency: string;
  payment_method_id: number;
  type: string;
  notes: string | null;
  items: {
    product_id: number;
    quantity: number;
    price: number;
    notes: string | null;
  }[];
  payment: {
    amount: number;
  } | null;
}