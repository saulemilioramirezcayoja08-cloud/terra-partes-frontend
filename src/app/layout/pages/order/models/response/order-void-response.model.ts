export interface order_void_response {
  order: {
    id: number;
    number: string;
    status: string;
    notes: string | null;
    updated_at: string;
  };
  reservations: {
    voided: number;
  };
}