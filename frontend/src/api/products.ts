import { httpClient, field, unwrap, unwrapPaged } from './client';
import type { PagedResult, Product, ProductInput } from '../types';

function mapProduct(raw: unknown): Product {
  return {
    id: field<number>(raw, 'id'),
    name: field<string>(raw, 'name') ?? '',
    sku: field<string>(raw, 'sku') ?? '',
    category: field<string>(raw, 'category') ?? '',
    companyId: field<string>(raw, 'companyId') ?? '',
    createdAt: field<string | null>(raw, 'createdAt') ?? null,
    updatedAt: field<string | null>(raw, 'updatedAt') ?? null,
  };
}

export interface ProductPagedParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
}

export const productsApi = {
  async getPaged(companyId: string, params: ProductPagedParams): Promise<PagedResult<Product>> {
    const res = await httpClient.get('/products/paged', {
      params: {
        companyId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
        category: params.category || undefined,
      },
    });
    return unwrapPaged<unknown, Product>(res.data, mapProduct);
  },

  async getByCompany(companyId: string): Promise<Product[]> {
    const res = await httpClient.get(`/products/by-company/${encodeURIComponent(companyId)}`);
    const data = unwrap<unknown[]>(res.data).data ?? [];
    return data.map(mapProduct);
  },

  async create(companyId: string, input: ProductInput): Promise<void> {
    await httpClient.post('/products/create', {
      CompanyId: companyId,
      Name: input.name,
      Sku: input.sku,
      Category: input.category,
    });
  },

  async update(id: number, companyId: string, input: ProductInput): Promise<void> {
    await httpClient.post('/products/update', {
      Id: id,
      CompanyId: companyId,
      Name: input.name,
      Sku: input.sku,
      Category: input.category,
    });
  },

  async remove(id: number, companyId: string): Promise<void> {
    await httpClient.post('/products/delete', { Id: id, CompanyId: companyId });
  },
};
