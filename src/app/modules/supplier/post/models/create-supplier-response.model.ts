export interface CreateSupplierResponse {
  id: number;
  taxId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}
