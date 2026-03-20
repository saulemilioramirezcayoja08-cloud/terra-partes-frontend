export interface purchase_payment_list_response {
  purchase: {
    id: number;
    number: string;
    status: string;
    currency: string;
  };
  supplier: {
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