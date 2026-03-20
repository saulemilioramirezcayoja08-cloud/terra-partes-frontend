export interface income_concept_create_response {
  concept: {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
  };
  user: {
    id: number;
    name: string;
  };
}