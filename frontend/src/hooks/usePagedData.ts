import { useCallback, useEffect, useRef, useState } from 'react';
import type { PagedResult } from '../types';
import { getErrorMessage } from '../api';
import { useNotify } from '../context/SnackbarContext';

export interface PaginationModel {
  page: number;
  pageSize: number;
}

interface UsePagedDataResult<T> {
  rows: T[];
  rowCount: number;
  loading: boolean;
  paginationModel: PaginationModel;
  setPaginationModel: (model: PaginationModel) => void;
  reload: () => void;
}

export function usePagedData<T>(
  fetcher: (page: number, pageSize: number) => Promise<PagedResult<T>>,
  resetKey: string,
  defaultPageSize = 25,
): UsePagedDataResult<T> {
  const { notify } = useNotify();
  const [rows, setRows] = useState<T[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<PaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const { page, pageSize } = paginationModel;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcherRef.current(page + 1, pageSize);
      setRows(result.items);
      setRowCount(result.totalCount);
    } catch (error) {
      setRows([]);
      setRowCount(0);
      notify(getErrorMessage(error, 'Veriler yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, notify]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setPaginationModel((m) => ({ ...m, page: 0 }));
  }, [resetKey]);

  useEffect(() => {
    void load();
  }, [page, pageSize, resetKey]);

  return {
    rows,
    rowCount,
    loading,
    paginationModel,
    setPaginationModel,
    reload: load,
  };
}
