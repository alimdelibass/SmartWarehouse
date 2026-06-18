import { httpClient, field, unwrap, unwrapPaged } from './client';
import type { LocationInput, PagedResult, WarehouseLocation } from '../types';

function mapLocation(raw: unknown): WarehouseLocation {
  return {
    id: field<number>(raw, 'id'),
    name: field<string>(raw, 'name') ?? '',
    address: field<string>(raw, 'address') ?? '',
    companyId: field<string>(raw, 'companyId') ?? '',
    createdAt: field<string | null>(raw, 'createdAt') ?? null,
    updatedAt: field<string | null>(raw, 'updatedAt') ?? null,
  };
}

export interface LocationPagedParams {
  page: number;
  pageSize: number;
  search?: string;
}

export const locationsApi = {
  async getPaged(
    companyId: string,
    params: LocationPagedParams,
  ): Promise<PagedResult<WarehouseLocation>> {
    const res = await httpClient.get('/warehouselocations/paged', {
      params: {
        companyId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
      },
    });
    return unwrapPaged<unknown, WarehouseLocation>(res.data, mapLocation);
  },

  async getByCompany(companyId: string): Promise<WarehouseLocation[]> {
    const res = await httpClient.get(
      `/warehouselocations/by-company/${encodeURIComponent(companyId)}`,
    );
    const data = unwrap<unknown[]>(res.data).data ?? [];
    return data.map(mapLocation);
  },

  async create(companyId: string, input: LocationInput): Promise<void> {
    await httpClient.post('/warehouselocations/create', {
      CompanyId: companyId,
      Name: input.name,
      Address: input.address,
    });
  },

  async update(id: number, companyId: string, input: LocationInput): Promise<void> {
    await httpClient.post('/warehouselocations/update', {
      Id: id,
      CompanyId: companyId,
      Name: input.name,
      Address: input.address,
    });
  },

  async remove(id: number, companyId: string): Promise<void> {
    await httpClient.post('/warehouselocations/delete', { Id: id, CompanyId: companyId });
  },
};
