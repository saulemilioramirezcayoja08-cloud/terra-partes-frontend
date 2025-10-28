export interface RoleInfo {
  id: number;
  code: string;
  name: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: RoleInfo[];
}
