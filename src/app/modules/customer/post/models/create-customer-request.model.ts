export interface CreateCustomerRequest {
  taxId?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  userId: number;
}
