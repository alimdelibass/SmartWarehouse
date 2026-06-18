import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useTranslation } from 'react-i18next';
import { stocksApi, productsApi, locationsApi, getErrorMessage } from '../../api';
import type {
  MovementType,
  Product,
  Stock,
  StockMovement,
  StockMovementInput,
  WarehouseLocation,
} from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { useNotify } from '../../context/SnackbarContext';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagedData } from '../../hooks/usePagedData';
import { formatDateTime } from '../../utils/format';
import { dataGridSx, getGridLocaleText } from '../../components/dataGridConfig';
import StockMovementDialog from './StockMovementDialog';

const LOW_STOCK_THRESHOLD = 10;

interface StocksTabProps {
  onDataChanged?: () => void;
}

export default function StocksTab({ onDataChanged }: StocksTabProps) {
  const { t, i18n } = useTranslation();
  const { companyId } = useCompany();
  const { notify } = useNotify();
  const locale = i18n.language.startsWith('en') ? 'en-US' : 'tr-TR';
  const numberLocale = locale;

  if (!companyId) return null;

  const [view, setView] = useState<'levels' | 'movements'>('levels');

  const [stockSearch, setStockSearch] = useState('');
  const debouncedStockSearch = useDebounce(stockSearch);
  const [locationFilter, setLocationFilter] = useState<number | ''>('');

  const [movementSearch, setMovementSearch] = useState('');
  const debouncedMovementSearch = useDebounce(movementSearch);
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([productsApi.getByCompany(companyId), locationsApi.getByCompany(companyId)])
      .then(([prod, loc]) => {
        if (!active) return;
        setProducts(prod);
        setLocations(loc);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setLocations([]);
      });
    return () => {
      active = false;
    };
  }, [companyId]);

  const stockFetcher = useCallback(
    (page: number, pageSize: number) =>
      stocksApi.getStocksPaged(companyId, {
        page,
        pageSize,
        search: debouncedStockSearch,
        warehouseLocationId: locationFilter,
      }),
    [companyId, debouncedStockSearch, locationFilter],
  );

  const movementFetcher = useCallback(
    (page: number, pageSize: number) =>
      stocksApi.getMovementsPaged(companyId, {
        page,
        pageSize,
        search: debouncedMovementSearch,
        type: typeFilter,
      }),
    [companyId, debouncedMovementSearch, typeFilter],
  );

  const stockData = usePagedData<Stock>(
    stockFetcher,
    `${companyId}|${debouncedStockSearch}|${locationFilter}`,
  );
  const movementData = usePagedData<StockMovement>(
    movementFetcher,
    `${companyId}|${debouncedMovementSearch}|${typeFilter}`,
  );

  const handleMovementSubmit = async (input: StockMovementInput) => {
    setSaving(true);
    try {
      await stocksApi.applyMovement(companyId, input);
      notify(
        input.type === 'In' ? t('stocks.notifyIn') : t('stocks.notifyOut'),
        'success',
      );
      setDialogOpen(false);
      stockData.reload();
      movementData.reload();
      onDataChanged?.();
    } catch (error) {
      notify(getErrorMessage(error, t('stocks.notifyError')), 'error');
    } finally {
      setSaving(false);
    }
  };

  const gridLocaleText = useMemo(
    () => getGridLocaleText(t, i18n.language),
    [t, i18n.language],
  );

  const stockColumns = useMemo<GridColDef<Stock>[]>(
    () => [
      { field: 'id', headerName: t('common.id'), width: 80 },
      { field: 'productName', headerName: t('common.product'), flex: 1, minWidth: 180 },
      {
        field: 'warehouseLocationName',
        headerName: t('common.location'),
        flex: 1,
        minWidth: 160,
      },
      {
        field: 'quantity',
        headerName: t('common.quantity'),
        width: 160,
        type: 'number',
        renderCell: (params) => {
          const low = params.row.quantity <= LOW_STOCK_THRESHOLD;
          return (
            <Chip
              size="small"
              label={params.row.quantity.toLocaleString(numberLocale)}
              color={low ? 'warning' : 'default'}
              variant={low ? 'filled' : 'outlined'}
            />
          );
        },
      },
    ],
    [t, numberLocale],
  );

  const movementColumns = useMemo<GridColDef<StockMovement>[]>(
    () => [
      { field: 'id', headerName: t('common.id'), width: 80 },
      { field: 'productName', headerName: t('common.product'), flex: 1, minWidth: 160 },
      {
        field: 'warehouseLocationName',
        headerName: t('common.location'),
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'type',
        headerName: t('common.type'),
        width: 130,
        renderCell: (params) =>
          params.row.type === 'In' ? (
            <Chip
              size="small"
              color="success"
              icon={<LoginRoundedIcon />}
              label={t('stocks.movementIn')}
              variant="outlined"
            />
          ) : (
            <Chip
              size="small"
              color="warning"
              icon={<LogoutRoundedIcon />}
              label={t('stocks.movementOut')}
              variant="outlined"
            />
          ),
      },
      { field: 'quantity', headerName: t('common.quantity'), width: 110, type: 'number' },
      {
        field: 'transactionDate',
        headerName: t('common.date'),
        width: 170,
        valueFormatter: (value) => formatDateTime(value as string | null, locale),
      },
    ],
    [t, locale],
  );

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Tabs
          value={view}
          onChange={(_, v: 'levels' | 'movements') => setView(v)}
          sx={{ minHeight: 0 }}
        >
          <Tab value="levels" label={t('stocks.stockLevels')} sx={{ minHeight: 0 }} />
          <Tab value="movements" label={t('stocks.movementHistory')} sx={{ minHeight: 0 }} />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<SwapVertRoundedIcon />}
          onClick={() => setDialogOpen(true)}
        >
          {t('stocks.stockInOut')}
        </Button>
      </Stack>

      {view === 'levels' ? (
        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              size="small"
              placeholder={t('stocks.searchPlaceholder')}
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              select
              label={t('common.location')}
              value={locationFilter === '' ? '' : String(locationFilter)}
              onChange={(e) =>
                setLocationFilter(e.target.value === '' ? '' : Number(e.target.value))
              }
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              {locations.map((l) => (
                <MenuItem key={l.id} value={String(l.id)}>
                  {l.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <DataGrid<Stock>
            rows={stockData.rows}
            columns={stockColumns}
            getRowId={(row) => row.id}
            rowCount={stockData.rowCount}
            loading={stockData.loading}
            paginationMode="server"
            paginationModel={stockData.paginationModel}
            onPaginationModelChange={stockData.setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            getRowClassName={(params) =>
              params.row.quantity <= LOW_STOCK_THRESHOLD ? 'row-low-stock' : ''
            }
            disableColumnMenu
            disableRowSelectionOnClick
            localeText={gridLocaleText}
            sx={dataGridSx}
          />
        </Box>
      ) : (
        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              size="small"
              placeholder={t('stocks.searchPlaceholder')}
              value={movementSearch}
              onChange={(e) => setMovementSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              select
              label={t('stocks.transactionType')}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MovementType | '')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="In">{t('stocks.movementIn')}</MenuItem>
              <MenuItem value="Out">{t('stocks.movementOut')}</MenuItem>
            </TextField>
          </Stack>

          <DataGrid<StockMovement>
            rows={movementData.rows}
            columns={movementColumns}
            getRowId={(row) => row.id}
            rowCount={movementData.rowCount}
            loading={movementData.loading}
            paginationMode="server"
            paginationModel={movementData.paginationModel}
            onPaginationModelChange={movementData.setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            disableColumnMenu
            disableRowSelectionOnClick
            localeText={gridLocaleText}
            sx={dataGridSx}
          />
        </Box>
      )}

      <StockMovementDialog
        open={dialogOpen}
        saving={saving}
        products={products}
        locations={locations}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleMovementSubmit}
      />
    </Box>
  );
}
