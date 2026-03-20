export interface api_response<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
  timestamp: string;
}

export interface page_response<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
