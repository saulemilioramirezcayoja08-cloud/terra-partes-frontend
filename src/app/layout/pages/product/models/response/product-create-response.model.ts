export interface product_create_response {
  product: {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    uom: string;
    price: number;
    origin: string;
    created_at: string;
  };
  category: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    name: string;
  };
  codes: {
    id: number;
    type: string;
    code: string;
  }[];
}
