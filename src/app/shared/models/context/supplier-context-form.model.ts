import {supplier_create_response} from '../../../layout/pages/supplier/models/response/supplier-create-response.model';

export interface supplier_context_form {
  form: {
    user_id: number | null;
    tax_id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  last_supplier: supplier_create_response | null;
}
