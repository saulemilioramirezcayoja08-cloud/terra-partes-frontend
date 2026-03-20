export interface product_create_request {
  user_id: number;
  sku: string;
  name: string;
  description: string | null;
  category_id: number | null;
  uom: string;
  price: number;
  origin: string;
  codes: {
    type: string;
    code: string;
  }[];
}
