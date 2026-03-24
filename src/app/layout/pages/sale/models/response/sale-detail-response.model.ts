export interface sale_detail_response {
  sale: {
    id: number;
    number: string;
    status: string;
    currency: string;
    notes: string | null;
    order_id: number;
    created_at: string;
  };
  user: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  payment_method: {
    id: number;
    name: string;
  };
  items: {
    id: number;
    product_id: number;
    product_sku: string;
    product_name: string;
    product_origin: string;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
  }[];
  payments: {
    id: number;
    amount: number;
    user_name: string | null;
    created_at: string;
  }[];
  totals: {
    total: number;
    cost: number;
    margin: number;
    paid: number;
    pending: number;
  };
}
