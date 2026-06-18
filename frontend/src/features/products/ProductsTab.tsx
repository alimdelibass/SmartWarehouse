import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from 'react-i18next';
import { productsApi, getErrorMessage } from '../../api';
import type { Product, ProductInput } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { useNotify } from '../../context/SnackbarContext';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagedData } from '../../hooks/usePagedData';
import { formatDateTime } from '../../utils/format';
import { dataGridSx, getGridLocaleText } from '../../components/dataGridConfig';
import ConfirmDialog from '../../components/ConfirmDialog';
import ProductFormDialog from './ProductFormDialog';

interface ProductsTabProps {
  onDataChanged?: () => void;
}

export default function ProductsTab({ onDataChanged }: ProductsTabProps) {
  const { t, i18n } = useTranslation();
  const { companyId } = useCompany();
  const { notify } = useNotify();
  const locale = i18n.language.startsWith('en') ? 'en-US' : 'tr-TR';

  if (!companyId) return null;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounce(search);

  const [categories, setCategories] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      productsApi.getPaged(companyId, {
        page,
        pageSize,
        search: debouncedSearch,
        category,
      }),
    [companyId, debouncedSearch, category],
  );

  const resetKey = `${companyId}|${debouncedSearch}|${category}`;
  const { rows, rowCount, loading, paginationModel, setPaginationModel, reload } =
    usePagedData<Product>(fetcher, resetKey);

  useEffect(() => {
    let active = true;
    productsApi
      .getByCompany(companyId)
      .then((items) => {
        if (!active) return;
        const unique = Array.from(
          new Set(items.map((p) => p.category).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b, locale));
        setCategories(unique);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, [companyId, locale]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleSubmit = async (input: ProductInput) => {
    setSaving(true);
    try {
      if (editing) {
        await productsApi.update(editing.id, companyId, input);
        notify(t('products.notifyUpdated'), 'success');
      } else {
        await productsApi.create(companyId, input);
        notify(t('products.notifyCreated'), 'success');
      }
      setFormOpen(false);
      reload();
      onDataChanged?.();
    } catch (error) {
      notify(getErrorMessage(error, t('products.notifySaveError')), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.remove(deleteTarget.id, companyId);
      notify(t('products.notifyDeleted'), 'success');
      setDeleteTarget(null);
      reload();
      onDataChanged?.();
    } catch (error) {
      notify(getErrorMessage(error, t('products.notifyDeleteError')), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const gridLocaleText = useMemo(
    () => getGridLocaleText(t, i18n.language),
    [t, i18n.language],
  );

  const columns = useMemo<GridColDef<Product>[]>(
    () => [
      { field: 'id', headerName: t('common.id'), width: 80 },
      { field: 'name', headerName: t('products.productName'), flex: 1, minWidth: 180 },
      { field: 'sku', headerName: t('common.sku'), width: 160 },
      { field: 'category', headerName: t('common.category'), width: 160 },
      {
        field: 'createdAt',
        headerName: t('common.createdAt'),
        width: 170,
        valueFormatter: (value) => formatDateTime(value as string | null, locale),
      },
      {
        field: 'actions',
        headerName: t('common.actions'),
        width: 120,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box>
            <Tooltip title={t('common.edit')}>
              <IconButton size="small" color="primary" onClick={() => openEdit(params.row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row)}>
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
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
      >
        <TextField
          size="small"
          placeholder={t('products.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
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
          label={t('common.category')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">{t('common.all')}</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          {t('products.newProduct')}
        </Button>
      </Stack>

      <DataGrid<Product>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={rowCount}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        disableColumnMenu
        disableRowSelectionOnClick
        localeText={gridLocaleText}
        sx={dataGridSx}
      />

      <ProductFormDialog
        open={formOpen}
        initial={editing}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('products.deleteTitle')}
        description={t('products.deleteDescription', { name: deleteTarget?.name ?? '' })}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
