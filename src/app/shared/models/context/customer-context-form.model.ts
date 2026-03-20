import {customer_create_response} from '../../../layout/pages/customer/models/response/customer-create-response.model';

export interface customer_context_form {
  form: {
    user_id: number | null;
    tax_id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  last_customer: customer_create_response | null;
}
