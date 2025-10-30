export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  address: string;
  taxId: string;
}

export interface WarehouseInfo {
  id: number;
  name: string;
}

export interface PaymentInfo {
  id: number;
  name: string;
}

export interface UserInfo {
  id: number;
  username: string;
  name?: string;
}

export interface QuotationInfo {
  id: number;
  number: string;
}

export interface ProductInfo {
  id: number;
  sku: string;
  name: string;
}

export interface ReservationInfo {
  id: number;
  status: string;
}

export interface DetailInfo {
  id: number;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  product: ProductInfo;
  reservation: ReservationInfo;
}

export interface TotalsInfo {
  total: number;
  totalPayments: number;
  pendingAmount: number;
  productCount: number;
}

export interface OrderListResponse {
  id: number;
  number: string;
  status: string;
  currency: string;
  createdAt: string;
  notes?: string;
  customer: CustomerInfo;
  warehouse: WarehouseInfo;
  payment: PaymentInfo;
  user?: UserInfo;
  quotation?: QuotationInfo;
  details: DetailInfo[];
  totals: TotalsInfo;
}
