export interface order_list_response {
  order: {
    id: number;
    number: string;
    status: string;
    created_at: string;
    currency: string;
    quotation_id: number | null;
  };
  customer: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
  };
  payment_method: {
    id: number;
    name: string;
  };
  totals: {
    total: number;
    paid: number;
    pending: number;
  };
}
