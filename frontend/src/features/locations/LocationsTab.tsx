import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
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
import { locationsApi, getErrorMessage } from '../../api';
import type { LocationInput, WarehouseLocation } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import { useNotify } from '../../context/SnackbarContext';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagedData } from '../../hooks/usePagedData';
import { formatDateTime } from '../../utils/format';
import { dataGridSx, getGridLocaleText } from '../../components/dataGridConfig';
import ConfirmDialog from '../../components/ConfirmDialog';
import LocationFormDialog from './LocationFormDialog';

interface LocationsTabProps {
  onDataChanged?: () => void;
}

export default function LocationsTab({ onDataChanged }: LocationsTabProps) {
  const { t, i18n } = useTranslation();
  const { companyId } = useCompany();
  const { notify } = useNotify();
  const locale = i18n.language.startsWith('en') ? 'en-US' : 'tr-TR';

  if (!companyId) return null;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseLocation | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<WarehouseLocation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      locationsApi.getPaged(companyId, { page, pageSize, search: debouncedSearch }),
    [companyId, debouncedSearch],
  );

  const resetKey = `${companyId}|${debouncedSearch}`;
  const { rows, rowCount, loading, paginationModel, setPaginationModel, reload } =
    usePagedData<WarehouseLocation>(fetcher, resetKey);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (location: WarehouseLocation) => {
    setEditing(location);
    setFormOpen(true);
  };

  const handleSubmit = async (input: LocationInput) => {
    setSaving(true);
    try {
      if (editing) {
        await locationsApi.update(editing.id, companyId, input);
        notify(t('locations.notifyUpdated'), 'success');
      } else {
        await locationsApi.create(companyId, input);
        notify(t('locations.notifyCreated'), 'success');
      }
      setFormOpen(false);
      reload();
      onDataChanged?.();
    } catch (error) {
      notify(getErrorMessage(error, t('locations.notifySaveError')), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await locationsApi.remove(deleteTarget.id, companyId);
      notify(t('locations.notifyDeleted'), 'success');
      setDeleteTarget(null);
      reload();
      onDataChanged?.();
    } catch (error) {
      notify(getErrorMessage(error, t('locations.notifyDeleteError')), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const gridLocaleText = useMemo(
    () => getGridLocaleText(t, i18n.language),
    [t, i18n.language],
  );

  const columns = useMemo<GridColDef<WarehouseLocation>[]>(
    () => [
      { field: 'id', headerName: t('common.id'), width: 80 },
      { field: 'name', headerName: t('locations.locationName'), flex: 1, minWidth: 180 },
      { field: 'address', headerName: t('common.address'), flex: 1.5, minWidth: 220 },
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
          placeholder={t('locations.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
          {t('locations.newLocation')}
        </Button>
      </Stack>

      <DataGrid<WarehouseLocation>
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

      <LocationFormDialog
        open={formOpen}
        initial={editing}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('locations.deleteTitle')}
        description={t('locations.deleteDescription', { name: deleteTarget?.name ?? '' })}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
