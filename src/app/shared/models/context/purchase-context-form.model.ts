import { purchase_create_response } from "../../../layout/pages/purchase/models/response/purchase-create-response.model";

export interface purchase_context_form {
  form: {
    user_id: number | null;
    supplier_id: number | null;
    warehouse_id: number;
    currency: string;
    type: string;
    notes: string;
  };
  payment: {
    method_id: number;
    amount: number;
  } | null;
  items: {
    product: {
      id: number;
      sku: string;
      name: string;
      uom: string;
      origin: string;
    };
    category: {
      name: string;
    } | null;
    stock: {
      available: number;
    };
    detail: {
      quantity: number;
      price: number;
      notes: string | null;
    };
  }[];
  last_purchase: purchase_create_response | null;
}