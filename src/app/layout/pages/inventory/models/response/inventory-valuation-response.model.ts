export interface inventory_valuation_response {
  product: {
    id: number;
    sku: string;
    name: string;
    uom: string;
    price: number;
  };
  category: {
    id: number;
    name: string;
  } | null;
  warehouse: {
    id: number;
    code: string;
    name: string;
  };
  lots: {
    id: number;
    purchase_number: string;
    purchase_type: string;
    purchase_currency: string;
    purchase_created_at: string;
    supplier: string;
    original: number;
    remaining: number;
    cost: number;
    value: number;
  }[];
}