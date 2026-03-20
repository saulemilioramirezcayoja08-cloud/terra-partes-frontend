export interface sale_receivables_response {
  sale: {
    id: number;
    number: string;
    currency: string;
    created_at: string;
  };
  customer: {
    id: number;
    name: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  payment_method: {
    id: number;
    name: string;
  };
  total: number;
  paid: number;
  balance: number;
  payments: {
    id: number;
    amount: number;
    created_at: string;
  }[];
}