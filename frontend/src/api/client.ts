import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { ApiResponse, PagedResult } from '../types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5083/api';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

function toLowerKeyMap(obj: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      out[key.toLowerCase()] = (obj as Record<string, unknown>)[key];
    }
  }
  return out;
}

export function field<T = unknown>(obj: unknown, name: string): T {
  const map = toLowerKeyMap(obj);
  return map[name.toLowerCase()] as T;
}

export function unwrap<T>(raw: unknown): ApiResponse<T> {
  const map = toLowerKeyMap(raw);
  return {
    success: Boolean(map['success']),
    message: (map['message'] as string | null) ?? null,
    data: map['data'] as T,
  };
}

export function unwrapPaged<TRaw, TOut>(
  raw: unknown,
  mapItem: (item: TRaw) => TOut,
): PagedResult<TOut> {
  const data = unwrap<unknown>(raw).data;
  const map = toLowerKeyMap(data);
  const rawItems = (map['items'] as TRaw[]) ?? [];
  const pageSize = Number(map['pagesize'] ?? 0);
  const totalCount = Number(map['totalcount'] ?? 0);
  const totalPagesRaw = map['totalpages'];
  return {
    items: rawItems.map(mapItem),
    totalCount,
    page: Number(map['page'] ?? 1),
    pageSize,
    totalPages:
      totalPagesRaw != null
        ? Number(totalPagesRaw)
        : pageSize > 0
          ? Math.ceil(totalCount / pageSize)
          : 0,
  };
}

function extractValidationMessage(data: unknown): string | undefined {
  const errors = field<Record<string, string[]>>(data, 'errors');
  if (!errors || typeof errors !== 'object') return undefined;

  for (const key of Object.keys(errors)) {
    const messages = errors[key];
    if (!Array.isArray(messages) || messages.length === 0) continue;
    const text = messages[0]?.trim();
    if (!text || text === 'The dto field is required.') continue;
    return text;
  }

  return undefined;
}

export function getErrorMessage(error: unknown, fallback = 'Bir hata oluştu.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const message = field<string>(data, 'message');
      if (message?.trim()) return message.trim();

      const validationMessage = extractValidationMessage(data);
      if (validationMessage) return validationMessage;

      const title = field<string>(data, 'title');
      if (title?.trim() && title !== 'One or more validation errors occurred.') {
        return title.trim();
      }
    }
    if (error.response?.status) {
      return `Sunucu hatası (${error.response.status}).`;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Sunucuya ulaşılamadı. Backend çalışıyor mu?';
    }
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
