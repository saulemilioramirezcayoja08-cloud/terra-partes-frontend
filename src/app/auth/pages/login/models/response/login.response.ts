export interface login_response {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  role: {
    id: number;
    code: string;
    name: string;
  };
}
