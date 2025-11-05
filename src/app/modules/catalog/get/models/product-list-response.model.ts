export interface ProductListResponse {
  id: number;
  sku: string;
  name: string;
  uom: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  user: User | null;
  codes: Code[];
  inventory: Inventory;
  last: Last;
}

export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
}

export interface Code {
  id: number;
  type: string;
  code: string;
  createdAt: string;
}

export interface Inventory {
  stock: number;
  reservation: number;
  available: number;
}

export interface Last {
  purchase: number | null;
  sale: number | null;
  quotation: number | null;
  order: number | null;
}
