export interface MarginReportResponse {
  period: Period;
  filters: Filters;
  products: ProductMargin[];
  summary: Summary;
}

export interface Period {
  startDate: string | null;
  endDate: string | null;
}

export interface Filters {
  productSku: string | null;
  username: string | null;
}

export interface ProductMargin {
  productId: number;
  sku: string;
  name: string;
  purchases: PurchaseData;
  sales: SaleData;
  margin: MarginData;
}

export interface PurchaseData {
  totalUnits: number;
  totalCost: number;
  transactions: number;
}

export interface SaleData {
  totalUnits: number;
  totalRevenue: number;
  transactions: number;
}

export interface MarginData {
  profitPercentage: number;
  totalProfit: number;
  status: 'PROFITABLE' | 'LOW_MARGIN' | 'NO_MARGIN' | 'LOSS';
}

export interface Summary {
  totalPurchaseCost: number;
  totalSalesRevenue: number;
  totalProfit: number;
  averageMarginPercentage: number;
  productsAnalyzed: number;
  topProfitableProducts: TopProduct[];
  lowMarginProducts: TopProduct[];
  lossProducts: TopProduct[];
}

export interface TopProduct {
  sku: string;
  name: string;
  totalProfit: number;
  marginPercentage: number;
}