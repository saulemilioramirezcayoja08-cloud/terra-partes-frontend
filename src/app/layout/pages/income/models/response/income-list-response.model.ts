export interface income_list_response {
  income: {
    id: number;
    number: string;
    created_at: string;
    currency: string;
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
  };
}