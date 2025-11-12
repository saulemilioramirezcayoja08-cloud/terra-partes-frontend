export interface UpdateProductResponse {
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