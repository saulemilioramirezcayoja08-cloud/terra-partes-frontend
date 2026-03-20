export interface sale_complete_response {
  sale: {
    id: number;
    number: string;
    status: string;
    updated_at: string;
  };
  inventory: {
    product_id: number;
    product_name: string;
    quantity_sold: number;
    movements: {
      purchase_detail_id: number;
      quantity: number;
      unit_cost: number;
    }[];
  }[];
}
