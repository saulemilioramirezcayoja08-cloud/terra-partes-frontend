export interface CustomerPreview {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface WarehousePreview {
  id: number;
  name: string;
}

export interface PaymentMethodPreview {
  id: number;
  name: string;
}

export interface DetailPreview {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string;
}

export interface PaymentPreview {
  amount: number;
  userId?: number;
}

export interface OrderPreview {
  customer: CustomerPreview;
  warehouse: WarehousePreview;
  paymentMethod: PaymentMethodPreview;
  currency: string;
  notes: string;
  details: DetailPreview[];
  payments: PaymentPreview[];
}

export const DEFAULT_CUSTOMER: CustomerPreview = {
  id: 1,
  name: 'Cliente General',
  phone: 'N/A',
  address: 'N/A'
};

export const DEFAULT_WAREHOUSE: WarehousePreview = {
  id: 1,
  name: 'Almacén Central'
};

export const DEFAULT_PAYMENT: PaymentMethodPreview = {
  id: 1,
  name: 'Efectivo'
};

export const DEFAULT_CURRENCY = 'BOB';
