export interface SupplierListResponse {
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
  activity: Activity;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Activity {
  purchases: number;
  total: number;
}
