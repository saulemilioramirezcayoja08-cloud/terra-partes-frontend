export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  uom: string;
  price: number;
  userId: number;
  codes?: CodeRequest[];
}

export interface CodeRequest {
  type: string;
  code: string;
}
