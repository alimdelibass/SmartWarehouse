import { httpClient, field, unwrap, unwrapPaged } from './client';
import type {
  MovementType,
  PagedResult,
  Stock,
  StockMovement,
  StockMovementChartItem,
  StockMovementInput,
  StockSummary,
} from '../types';

function normalizeType(value: unknown): MovementType {
  if (typeof value === 'number') return value === 1 ? 'Out' : 'In';
  const text = String(value ?? '').trim().toLowerCase();
  if (text === '1' || text === 'out' || text === 'cikis' || text === 'çıkış') return 'Out';
  return 'In';
}

function mapStock(raw: unknown): Stock {
  return {
    id: field<number>(raw, 'id'),
    productId: field<number>(raw, 'productId'),
    productName: field<string>(raw, 'productName') ?? '',
    warehouseLocationId: field<number>(raw, 'warehouseLocationId'),
    warehouseLocationName: field<string>(raw, 'warehouseLocationName') ?? '',
    quantity: Number(field<number>(raw, 'quantity') ?? 0),
    companyId: field<string>(raw, 'companyId') ?? '',
  };
}

function mapMovement(raw: unknown): StockMovement {
  return {
    id: field<number>(raw, 'id'),
    productId: field<number>(raw, 'productId'),
    productName: field<string>(raw, 'productName') ?? '',
    warehouseLocationId: field<number>(raw, 'warehouseLocationId'),
    warehouseLocationName: field<string>(raw, 'warehouseLocationName') ?? '',
    quantity: Number(field<number>(raw, 'quantity') ?? 0),
    type: normalizeType(field(raw, 'type')),
    transactionDate: field<string | null>(raw, 'transactionDate') ?? null,
    companyId: field<string>(raw, 'companyId') ?? '',
  };
}

function mapSummary(raw: unknown): StockSummary {
  return {
    totalProducts: Number(field<number>(raw, 'totalProducts') ?? 0),
    totalLocations: Number(field<number>(raw, 'totalLocations') ?? 0),
    totalStockQuantity: Number(field<number>(raw, 'totalStockQuantity') ?? 0),
    lowStockCount: Number(field<number>(raw, 'lowStockCount') ?? 0),
  };
}

export interface StockPagedParams {
  page: number;
  pageSize: number;
  search?: string;
  warehouseLocationId?: number | '';
}

export interface MovementPagedParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: MovementType | '';
}

function mapChartItem(raw: unknown): StockMovementChartItem {
  const dateValue = field<string>(raw, 'date');
  return {
    date: dateValue ?? '',
    inQuantity: Number(field<number>(raw, 'inQuantity') ?? 0),
    outQuantity: Number(field<number>(raw, 'outQuantity') ?? 0),
  };
}

export const stocksApi = {
  async getStocksPaged(companyId: string, params: StockPagedParams): Promise<PagedResult<Stock>> {
    const res = await httpClient.get('/stocks/paged', {
      params: {
        companyId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
        warehouseLocationId: params.warehouseLocationId || undefined,
      },
    });
    return unwrapPaged<unknown, Stock>(res.data, mapStock);
  },

  async getMovementsPaged(
    companyId: string,
    params: MovementPagedParams,
  ): Promise<PagedResult<StockMovement>> {
    const res = await httpClient.get('/stocks/movements/paged', {
      params: {
        companyId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
        type: params.type || undefined,
      },
    });
    return unwrapPaged<unknown, StockMovement>(res.data, mapMovement);
  },

  async getSummary(companyId: string): Promise<StockSummary> {
    const res = await httpClient.get('/stocks/summary', { params: { companyId } });
    return mapSummary(unwrap<unknown>(res.data).data);
  },

  async getMovementChart(companyId: string): Promise<StockMovementChartItem[]> {
    const res = await httpClient.get('/stocks/movements/chart', { params: { companyId } });
    const data = unwrap<unknown[]>(res.data).data ?? [];
    return data.map(mapChartItem);
  },

  async applyMovement(companyId: string, input: StockMovementInput): Promise<void> {
    await httpClient.post('/stocks/movement', {
      CompanyId: companyId,
      ProductId: input.productId,
      WarehouseLocationId: input.warehouseLocationId,
      Quantity: input.quantity,
      Type: input.type,
    });
  },
};
