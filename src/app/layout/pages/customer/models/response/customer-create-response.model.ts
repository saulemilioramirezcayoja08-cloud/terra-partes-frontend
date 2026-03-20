export interface customer_create_response {
  customer: {
    id: number;
    tax_id: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    created_at: string;
  };
  user: {
    id: number;
    name: string;
  };
}
