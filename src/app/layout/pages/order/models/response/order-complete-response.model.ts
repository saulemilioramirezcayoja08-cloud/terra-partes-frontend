export interface order_complete_response {
  order: {
    id: number;
    number: string;
    status: string;
    updated_at: string;
  };
  sale: {
    id: number;
    number: string;
    status: string;
    created_at: string;
  };
}
