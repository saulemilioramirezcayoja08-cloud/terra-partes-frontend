import { SaleListResponse } from "./sale-list-response.model";

export interface SaleDraftListResponse {
  sales: SaleListResponse[];
  summary: Summary;
}

export interface Summary {
  totalSales: number;
  totalAmount: number;
  totalPayments: number;
  totalPending: number;
  totalItems: number;
  dateRange: DateRange;
  filters: Filters;
}

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface Filters {
  username: string | null;
  status: string;
}