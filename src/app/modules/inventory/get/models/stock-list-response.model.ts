export interface StockListResponse {
    warehouse: Warehouse;
    product: Product;
    stockTotal: number;
    reserved: number;
    available: number;
    price: number;
    inventoryValue: number;
    alertType: string | null;
    alertSeverity: string | null;
}

export interface Warehouse {
    id: number;
    code: string;
    name: string;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
}