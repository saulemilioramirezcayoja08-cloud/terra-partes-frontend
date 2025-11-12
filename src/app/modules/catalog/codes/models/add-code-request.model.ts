export interface AddCodeRequest {
  codes: CodeItem[];
  userId: number;
}

export interface CodeItem {
  type: string;
  code: string;
}