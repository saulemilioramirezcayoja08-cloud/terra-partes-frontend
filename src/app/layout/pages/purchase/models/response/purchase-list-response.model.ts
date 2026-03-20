export interface purchase_list_response {
  purchase: {
    id: number;
    number: string;
    status: string;
    type: string;
    currency: string;
    created_at: string;
  };
  supplier: {
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
