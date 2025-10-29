import {
  CustomerInfo,
  WarehouseInfo,
  PaymentInfo,
  UserInfo,
  DetailInfo,
  OrderPaymentInfo,
  ReservationInfo,
  TotalsInfo
} from './create-order-response.model';

export interface ConfirmOrderResponse {
  id: number;
  number: string;
  status: string;
  currency: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string;
  customer: CustomerInfo;
  warehouse: WarehouseInfo;
  payment: PaymentInfo;
  user: UserInfo;
  confirmedBy: UserInfo;
  details: DetailInfo[];
  payments: OrderPaymentInfo[];
  reservations: ReservationInfo[];
  totals: TotalsInfo;
}
