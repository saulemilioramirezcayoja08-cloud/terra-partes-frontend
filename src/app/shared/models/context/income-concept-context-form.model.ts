import { income_concept_create_response } from "../../../layout/pages/income/models/response/income-concept-create-response.model";

export interface income_concept_context_form {
  form: {
    user_id: number | null;
    name: string;
    description: string;
  };
  last_income_concept: income_concept_create_response | null;
}