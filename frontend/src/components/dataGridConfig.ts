import type { SxProps, Theme } from '@mui/material';
import type { GridLocaleText } from '@mui/x-data-grid';
import type { TFunction } from 'i18next';

export const dataGridSx: SxProps<Theme> = {
  height: 'clamp(420px, calc(100vh - 400px), 760px)',
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
    outline: 'none',
  },
  '& .row-low-stock': {
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
  },
  '& .row-low-stock:hover': {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
};

export function getGridLocaleText(t: TFunction, locale: string): Partial<GridLocaleText> {
  const numberLocale = locale === 'en' ? 'en-US' : 'tr-TR';
  return {
    noRowsLabel: t('dataGrid.noRows'),
    footerRowSelected: (count) =>
      t('dataGrid.footerRowSelected', { count: count.toLocaleString(numberLocale) }),
    footerTotalRows: t('dataGrid.footerTotalRows'),
    columnMenuSortAsc: t('dataGrid.sortAsc'),
    columnMenuSortDesc: t('dataGrid.sortDesc'),
    columnMenuUnsort: t('dataGrid.unsort'),
    columnHeaderSortIconLabel: t('dataGrid.sortIconLabel'),
    MuiTablePagination: {
      labelRowsPerPage: t('dataGrid.rowsPerPage'),
      labelDisplayedRows: ({ from, to, count }) =>
        t('dataGrid.displayedRows', {
          from,
          to,
          count: count !== -1 ? count : `${to}+`,
        }),
    },
  };
}
