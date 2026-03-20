export interface order_payment_list_response {
  order: {
    id: number;
    number: string;
    status: string;
    currency: string;
  };
  customer: {
    id: number;
    name: string;
  };
  payments: {
    id: number;
    amount: number;
    user_name: string | null;
    created_at: string;
  }[];
  totals: {
    total: number;
    paid: number;
    pending: number;
  };
}
