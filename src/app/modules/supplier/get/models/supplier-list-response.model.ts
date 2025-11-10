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
  purchases: Purchase[];
}

export interface Purchase {
  id: number;
  number: string;
  status: string;
  currency: string;
  createdAt: string;
  totals: Totals;
}

export interface Totals {
  total: number;
  items: number;
}