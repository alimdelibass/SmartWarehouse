import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { LocationInput, WarehouseLocation } from '../../types';

interface LocationFormDialogProps {
  open: boolean;
  initial: WarehouseLocation | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: LocationInput) => void;
}

const EMPTY: LocationInput = { name: '', address: '' };

type Errors = Partial<Record<keyof LocationInput, string>>;

export default function LocationFormDialog({
  open,
  initial,
  saving,
  onClose,
  onSubmit,
}: LocationFormDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<LocationInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name, address: initial.address } : EMPTY);
      setErrors({});
    }
  }, [open, initial]);

  const handleChange =
    (key: keyof LocationInput) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: event.target.value }));
    };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = t('locations.validation.nameRequired');
    if (!form.address.trim()) next.address = t('locations.validation.addressRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ name: form.name.trim(), address: form.address.trim() });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? t('locations.editLocation') : t('locations.newLocation')}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              label={t('locations.locationName')}
              value={form.name}
              onChange={handleChange('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              autoFocus
            />
            <TextField
              label={t('common.address')}
              value={form.address}
              onChange={handleChange('address')}
              error={Boolean(errors.address)}
              helperText={errors.address}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained">
          {initial ? t('common.save') : t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
