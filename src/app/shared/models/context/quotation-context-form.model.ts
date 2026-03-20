import { quotation_create_response } from "../../../layout/pages/quotation/models/response/quotation-create-response.model";

export interface quotation_context_form {
  form: {
    user_id: number | null;
    customer_id: number | null;
    warehouse_id: number;
    currency: string;
    notes: string;
  };
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
  last_quotation: quotation_create_response | null;
}