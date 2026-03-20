export interface product_list_response {
  product: {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    uom: string;
    price: number;
    origin: string;
  };
  category: {
    id: number;
    name: string;
  } | null;
  codes: {
    id: number;
    type: string;
    code: string;
  }[];
  stock: {
    total: number;
    reserved: number;
    available: number;
  };
  last: {
    purchase: number | null;
    sale: number | null;
    quotation: number | null;
    order: number | null;
  };
}
