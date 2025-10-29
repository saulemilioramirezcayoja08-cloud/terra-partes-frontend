export interface CodeInfo {
  id: number;
  type: string;
  code: string;
  createdAt: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
}

export interface UserInfo {
  id: number;
  username: string;
  name: string;
}

export interface InventoryInfo {
  stockQuantity: number;
  reservationQuantity: number;
  availableQuantity: number;
}

export interface LastPricesInfo {
  purchase: number;
  sale: number;
  quotation: number;
  order: number;
}

export interface ProductListResponse {
  id: number;
  sku: string;
  name: string;
  description: string;
  uom: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategoryInfo;
  user: UserInfo;
  codes: CodeInfo[];
  inventory: InventoryInfo;
  lastPrices: LastPricesInfo;
}
