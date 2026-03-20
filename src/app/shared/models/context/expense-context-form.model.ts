import {expense_create_response} from '../../../layout/pages/expense/models/response/expense-create-response.model';

export interface expense_context_form {
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
  last_expense: expense_create_response | null;
}
