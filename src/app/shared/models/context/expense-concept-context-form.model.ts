import { expense_concept_create_response } from "../../../layout/pages/expense/models/response/expense-concept-create-response.model";

export interface expense_concept_context_form {
  form: {
    user_id: number | null;
    name: string;
    description: string;
  };
  last_expense_concept: expense_concept_create_response | null;
}