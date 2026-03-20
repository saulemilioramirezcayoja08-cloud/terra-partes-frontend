import { income_create_response } from "../../../layout/pages/income/models/response/income-create-response.model";

export interface income_context_form {
  form: {
    user_id: number | null;
    payment_method_id: number | null;
    currency: string;
    date: string;
    notes: string;
  };
  items: {
    concept: {
      id: number;
      name: string;
      description: string | null;
    };
    amount: number;
    notes: string | null;
  }[];
  last_income: income_create_response | null;
}