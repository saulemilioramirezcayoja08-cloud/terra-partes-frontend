import {product_create_response} from '../../../layout/pages/product/models/response/product-create-response.model';

export interface product_context_form {
  form: {
    user_id: number | null;
    sku: string;
    name: string;
    description: string;
    category_id: number | null;
    uom: string;
    price: number;
    origin: string;
  };
  codes: {
    type: string;
    code: string;
  }[];
  last_product: product_create_response | null;
}
