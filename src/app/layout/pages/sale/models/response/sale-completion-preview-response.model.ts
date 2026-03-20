export interface sale_completion_preview_response {
  sale: {
    id: number;
    number: string;
    status: string;
    currency: string;
  };
  items: {
    product_id: number;
    product_sku: string;
    product_name: string;
    product_origin: string;
    quantity: number;
    stock: number;
    reserved: number;
    price: number;
    subtotal: number;
    cost: number;
    margin: number;
  }[];
  totals: {
    total: number;
    cost: number;
    margin: number;
  };
}
