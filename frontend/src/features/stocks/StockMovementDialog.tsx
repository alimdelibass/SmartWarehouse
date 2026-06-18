import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useTranslation } from 'react-i18next';
import type { MovementType, Product, StockMovementInput, WarehouseLocation } from '../../types';

interface StockMovementDialogProps {
  open: boolean;
  saving: boolean;
  products: Product[];
  locations: WarehouseLocation[];
  onClose: () => void;
  onSubmit: (input: StockMovementInput) => void;
}

interface FormState {
  productId: number | '';
  warehouseLocationId: number | '';
  quantity: string;
  type: MovementType;
}

const EMPTY: FormState = {
  productId: '',
  warehouseLocationId: '',
  quantity: '',
  type: 'In',
};

type Errors = Partial<Record<'productId' | 'warehouseLocationId' | 'quantity', string>>;

export default function StockMovementDialog({
  open,
  saving,
  products,
  locations,
  onClose,
  onSubmit,
}: StockMovementDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open]);

  const quantityNumber = useMemo(() => Number(form.quantity), [form.quantity]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (form.productId === '') next.productId = t('stocks.validation.productRequired');
    if (form.warehouseLocationId === '') {
      next.warehouseLocationId = t('stocks.validation.locationRequired');
    }
    if (!form.quantity.trim() || Number.isNaN(quantityNumber) || quantityNumber <= 0) {
      next.quantity = t('stocks.validation.quantityRequired');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      productId: Number(form.productId),
      warehouseLocationId: Number(form.warehouseLocationId),
      quantity: quantityNumber,
      type: form.type,
    });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('stocks.movementDialogTitle')}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('stocks.transactionType')}
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={form.type}
                onChange={(_, value: MovementType | null) => {
                  if (value) setForm((f) => ({ ...f, type: value }));
                }}
                color="primary"
              >
                <ToggleButton value="In" sx={{ gap: 1 }}>
                  <LoginRoundedIcon fontSize="small" /> {t('stocks.movementIn')}
                </ToggleButton>
                <ToggleButton value="Out" sx={{ gap: 1 }}>
                  <LogoutRoundedIcon fontSize="small" /> {t('stocks.movementOut')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              select
              label={t('common.product')}
              value={form.productId === '' ? '' : String(form.productId)}
              onChange={(e) =>
                setForm((f) => ({ ...f, productId: Number(e.target.value) }))
              }
              error={Boolean(errors.productId)}
              helperText={errors.productId}
              fullWidth
            >
              {products.length === 0 && (
                <MenuItem value="" disabled>
                  {t('stocks.noProducts')}
                </MenuItem>
              )}
              {products.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.sku})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t('stocks.warehouseLocation')}
              value={form.warehouseLocationId === '' ? '' : String(form.warehouseLocationId)}
              onChange={(e) =>
                setForm((f) => ({ ...f, warehouseLocationId: Number(e.target.value) }))
              }
              error={Boolean(errors.warehouseLocationId)}
              helperText={errors.warehouseLocationId}
              fullWidth
            >
              {locations.length === 0 && (
                <MenuItem value="" disabled>
                  {t('stocks.noLocations')}
                </MenuItem>
              )}
              {locations.map((l) => (
                <MenuItem key={l.id} value={String(l.id)}>
                  {l.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('common.quantity')}
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              error={Boolean(errors.quantity)}
              helperText={errors.quantity}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          variant="contained"
          color={form.type === 'In' ? 'success' : 'warning'}
        >
          {form.type === 'In' ? t('stocks.submitIn') : t('stocks.submitOut')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
