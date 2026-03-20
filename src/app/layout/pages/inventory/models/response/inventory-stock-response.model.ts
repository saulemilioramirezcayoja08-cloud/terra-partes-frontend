export interface inventory_stock_response {
  product: {
    id: number;
    sku: string;
    name: string;
    uom: string;
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
  stock: {
    quantity: number;
    reserved: number;
    available: number;
  };
}
