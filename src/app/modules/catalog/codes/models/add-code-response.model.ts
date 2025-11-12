export interface AddCodeResponse {
  productId: number;
  codes: CodeInfo[];
}

export interface CodeInfo {
  id: number;
  type: string;
  code: string;
  createdAt: string;
}