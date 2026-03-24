export interface quotation_create_response {
  quotation: {
    id: number;
    number: string;
    status: string;
    currency: string;
    notes: string | null;
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
  totals: {
    total: number;
  };
}