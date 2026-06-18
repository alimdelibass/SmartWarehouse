import { httpClient, field, unwrap, unwrapPaged } from './client';
import type { Company, CompanyInput, PagedQuery, PagedResult } from '../types';

function mapCompany(raw: unknown): Company {
  return {
    id: field<number>(raw, 'id'),
    code: field<string>(raw, 'code') ?? '',
    name: field<string>(raw, 'name') ?? '',
    createdAt: field<string | null>(raw, 'createdAt') ?? null,
  };
}

export const companiesApi = {
  async getAll(): Promise<Company[]> {
    const res = await httpClient.get('/companies');
    const data = unwrap<unknown[]>(res.data).data ?? [];
    return data.map(mapCompany);
  },

  async getPaged(params: PagedQuery): Promise<PagedResult<Company>> {
    const res = await httpClient.get('/companies/paged', {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search || undefined,
      },
    });
    return unwrapPaged<unknown, Company>(res.data, mapCompany);
  },

  async create(input: CompanyInput): Promise<Company> {
    const res = await httpClient.post('/companies/create', {
      Code: input.code,
      Name: input.name,
    });
    return mapCompany(unwrap<unknown>(res.data).data);
  },

  async update(id: number, input: Pick<CompanyInput, 'name'>): Promise<Company> {
    const res = await httpClient.post('/companies/update', {
      Id: id,
      Name: input.name,
    });
    return mapCompany(unwrap<unknown>(res.data).data);
  },

  async remove(id: number): Promise<void> {
    await httpClient.post('/companies/delete', { Id: id });
  },
};
