export interface quotation_list_response {
  quotation: {
    id: number;
    number: string;
    status: string;
    created_at: string;
    currency: string;
  };
  customer: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
  };
  totals: {
    total: number;
  };
}