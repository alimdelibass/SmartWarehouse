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
import type { CompanyInput } from '../../types';

interface CompanyFormDialogProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CompanyInput) => void;
}

const EMPTY: CompanyInput = { code: '', name: '' };

type Errors = Partial<Record<keyof CompanyInput, string>>;

export default function CompanyFormDialog({
  open,
  saving,
  onClose,
  onSubmit,
}: CompanyFormDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<CompanyInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open]);

  const handleChange =
    (key: keyof CompanyInput) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: event.target.value }));
    };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.code.trim()) next.code = t('company.validation.codeRequired');
    if (!form.name.trim()) next.name = t('company.validation.nameRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('company.add')}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              label={t('company.code')}
              value={form.code}
              onChange={handleChange('code')}
              error={Boolean(errors.code)}
              helperText={errors.code}
              fullWidth
              autoFocus
            />
            <TextField
              label={t('company.name')}
              value={form.name}
              onChange={handleChange('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained">
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
