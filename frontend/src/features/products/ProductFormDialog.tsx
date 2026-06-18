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
import type { Product, ProductInput } from '../../types';

interface ProductFormDialogProps {
  open: boolean;
  initial: Product | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}

const EMPTY: ProductInput = { name: '', sku: '', category: '' };

type Errors = Partial<Record<keyof ProductInput, string>>;

export default function ProductFormDialog({
  open,
  initial,
  saving,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { name: initial.name, sku: initial.sku, category: initial.category }
          : EMPTY,
      );
      setErrors({});
    }
  }, [open, initial]);

  const handleChange =
    (key: keyof ProductInput) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: event.target.value }));
    };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = t('products.validation.nameRequired');
    if (!form.sku.trim()) next.sku = t('products.validation.skuRequired');
    if (!form.category.trim()) next.category = t('products.validation.categoryRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? t('products.editProduct') : t('products.newProduct')}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              label={t('products.productName')}
              value={form.name}
              onChange={handleChange('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              autoFocus
            />
            <TextField
              label={t('common.sku')}
              value={form.sku}
              onChange={handleChange('sku')}
              error={Boolean(errors.sku)}
              helperText={errors.sku}
              fullWidth
            />
            <TextField
              label={t('common.category')}
              value={form.category}
              onChange={handleChange('category')}
              error={Boolean(errors.category)}
              helperText={errors.category}
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
          {initial ? t('common.save') : t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
