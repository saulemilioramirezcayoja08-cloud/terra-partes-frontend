export interface sale_list_response {
  sale: {
    id: number;
    number: string;
    status: string;
    created_at: string;
    currency: string;
    order_id: number | null;
  };
  customer: { id: number; name: string; } | null;
  user: { id: number; username: string; } | null;
  payment_method: { id: number; name: string; } | null;
  totals: {
    total: number;
    cost: number;
    margin: number;
    paid: number;
    pending: number;
  };
}
