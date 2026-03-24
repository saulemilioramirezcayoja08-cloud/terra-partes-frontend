export interface purchase_create_response {
  purchase: {
    id: number;
    number: string;
    status: string;
    type: string;
    currency: string;
    notes: string | null;
    created_at: string;
  };
  user: {
    id: number;
    name: string;
  };
  supplier: {
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
  payment: {
    id: number;
    amount: number;
  } | null;
  totals: {
    total: number;
    paid: number;
    pending: number;
  };
}
