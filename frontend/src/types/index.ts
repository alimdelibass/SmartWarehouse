export type MovementType = 'In' | 'Out';

export interface Company {
  id: number;
  code: string;
  name: string;
  createdAt: string | null;
}

export interface CompanyInput {
  code: string;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  companyId: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WarehouseLocation {
  id: number;
  name: string;
  address: string;
  companyId: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Stock {
  id: number;
  productId: number;
  productName: string;
  warehouseLocationId: number;
  warehouseLocationName: string;
  quantity: number;
  companyId: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  warehouseLocationId: number;
  warehouseLocationName: string;
  quantity: number;
  type: MovementType;
  transactionDate: string | null;
  companyId: string;
}

export interface StockSummary {
  totalProducts: number;
  totalLocations: number;
  totalStockQuantity: number;
  lowStockCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface ProductInput {
  name: string;
  sku: string;
  category: string;
}

export interface LocationInput {
  name: string;
  address: string;
}

export interface StockMovementInput {
  productId: number;
  warehouseLocationId: number;
  quantity: number;
  type: MovementType;
}

export interface StockMovementChartItem {
  date: string;
  inQuantity: number;
  outQuantity: number;
}

export interface PagedQuery {
  page: number;
  pageSize: number;
  search?: string;
}
