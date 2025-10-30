import {
  CustomerInfo,
  WarehouseInfo,
  PaymentInfo,
  UserInfo,
  DetailInfo,
  OrderPaymentInfo,
  ReservationInfo,
  TotalsInfo,
  QuotationInfo
} from './create-order-response.model';

export interface SaleInfo {
  id: number;
  number: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface ConfirmOrderResponse {
  id: number;
  number: string;
  status: string;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  customer: CustomerInfo;
  warehouse: WarehouseInfo;
  payment?: PaymentInfo | null;
  user?: UserInfo | null;

  quotation?: QuotationInfo | null;
  sale?: SaleInfo | null;

  details: DetailInfo[];
  payments: OrderPaymentInfo[];
  reservations: ReservationInfo[];

  totals: TotalsInfo;
}
