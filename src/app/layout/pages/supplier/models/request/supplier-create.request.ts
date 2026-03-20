export interface supplier_create_request {
  user_id: number;
  tax_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}
