import { PurchaseListResponse } from "./purchase-list-response.model";

export interface PurchaseDraftListResponse {
  purchases: PurchaseListResponse[];
  summary: Summary;
}

export interface Summary {
  totalPurchases: number;
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