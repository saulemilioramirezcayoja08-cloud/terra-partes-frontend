export interface income_create_request {
  user_id: number;
  payment_method_id: number;
  currency: string;
  date: string;
  notes: string | null;
  items: {
    concept_id: number;
    amount: number;
    notes: string | null;
  }[];
}