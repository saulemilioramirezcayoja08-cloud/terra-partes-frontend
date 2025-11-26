export interface GrossMarginReportResponse {
  totals: Totals;
  products: ProductMargin[];
  dateRange: DateRange;
}

export interface Totals {
  totalSales: number;
  totalPurchases: number;
  grossMargin: number;
  grossMarginPercent: number;
}

export interface ProductMargin {
  productId: number;
  sku: string;
  productName: string;
  quantitySold: number;
  salesAmount: number;
  quantityPurchased: number;
  purchasesAmount: number;
  margin: number;
  marginPercent: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}