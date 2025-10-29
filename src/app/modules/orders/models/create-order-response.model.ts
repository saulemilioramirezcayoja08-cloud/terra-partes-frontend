export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  address: string;
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
}

export interface QuotationInfo {
  id: number;
  number: string;
}

export interface DetailInfo {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderPaymentInfo {
  id: number;
  paymentId: number;
  paymentName: string;
  amount: number;
  notes: string;
  createdAt: string;
  username: string;
}

export interface ReservationInfo {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
}

export interface TotalsInfo {
  total: number;
  totalPayments: number;
  pendingAmount: number;
  productCount: number;
}

export interface CreateOrderResponse {
  id: number;
  number: string;
  status: string;
  currency: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  warehouse: WarehouseInfo;
  payment: PaymentInfo;
  user: UserInfo;
  quotation?: QuotationInfo;
  details: DetailInfo[];
  payments: OrderPaymentInfo[];
  reservations: ReservationInfo[];
  totals: TotalsInfo;
}
