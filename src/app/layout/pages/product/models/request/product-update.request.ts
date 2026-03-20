export interface product_update_request {
  sku: string;
  name: string;
  description: string | null;
  category_id: number | null;
  uom: string;
  price: number;
  origin: string;
  codes: {
    id?: number | null;
    type: string;
    code: string;
  }[];
}
