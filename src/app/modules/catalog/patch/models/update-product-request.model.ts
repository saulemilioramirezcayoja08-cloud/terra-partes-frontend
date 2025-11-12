export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: number;
  uom?: string;
  userId: number;
}