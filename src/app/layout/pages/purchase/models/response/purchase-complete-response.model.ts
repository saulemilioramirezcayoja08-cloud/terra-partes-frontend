export interface purchase_complete_response {
  purchase: {
    id: number;
    number: string;
    status: string;
    updated_at: string;
  };
  inventory: {
    product_id: number;
    product_name: string;
    warehouse_id: number;
    quantity_added: number;
    new_total: number;
  }[];
}