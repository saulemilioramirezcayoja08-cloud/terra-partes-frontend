export interface CreateProductResponse {
  id: number;
  sku: string;
  name: string;
  description?: string;
  uom: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  user: User;
  codes: Code[];
}

export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Code {
  id: number;
  type: string;
  code: string;
  createdAt: string;
}
