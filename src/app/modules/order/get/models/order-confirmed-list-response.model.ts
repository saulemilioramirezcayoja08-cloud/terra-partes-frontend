import { OrderListResponse } from "./order-list-response.model";

export interface OrderConfirmedListResponse {
  orders: OrderListResponse[];
  summary: Summary;
}

export interface Summary {
  totalOrders: number;
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