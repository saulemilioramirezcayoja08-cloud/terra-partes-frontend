import { order_create_response } from '../../../layout/pages/order/models/response/order-create-response.model';

export interface order_context_form {
  form: {
    user_id: number | null;
    customer_id: number | null;
    warehouse_id: number;
    currency: string;
    notes: string;
  };
  payment: {
    method_id: number;
    amount: number;
  } | null;
  reference: {
    quotation_id: number | null;
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
  last_order: order_create_response | null;
}
