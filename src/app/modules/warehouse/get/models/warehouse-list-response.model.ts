export interface WarehouseListResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  inventory: Inventory;
  activity: Activity;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface Inventory {
  products: number;
  stock: number;
  value: number;
}

export interface Activity {
  purchasesCount: number;
  purchasesTotal: number;
  ordersCount: number;
  ordersTotal: number;
  salesCount: number;
  salesTotal: number;
}
