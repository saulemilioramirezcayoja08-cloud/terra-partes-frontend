export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
}
