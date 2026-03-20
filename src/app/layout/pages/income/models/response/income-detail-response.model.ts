export interface income_detail_response {
  income: {
    id: number;
    number: string;
    currency: string;
    date: string;
    notes: string | null;
    created_at: string;
  };
  user: {
    id: number;
    name: string;
  };
  payment_method: {
    id: number;
    name: string;
  };
  items: {
    id: number;
    concept_id: number;
    concept_name: string;
    amount: number;
    notes: string | null;
  }[];
  totals: {
    total: number;
  };
}