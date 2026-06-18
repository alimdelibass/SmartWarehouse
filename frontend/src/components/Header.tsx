import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../api';
import { useCompany } from '../context/CompanyContext';
import { useNotify } from '../context/SnackbarContext';
import type { CompanyInput } from '../types';
import CompanyFormDialog from '../features/companies/CompanyFormDialog';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { notify } = useNotify();
  const { companies, companyId, setCompanyId, createCompany, companiesLoading } = useCompany();

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCompanyChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCompanyId(value || null);
  };

  const handleLanguageChange = (_: unknown, value: string | null) => {
    if (value) void i18n.changeLanguage(value);
  };

  const handleCreateCompany = async (input: CompanyInput) => {
    setSaving(true);
    try {
      await createCompany(input);
      setFormOpen(false);
      notify(t('company.notifyCreated'), 'success');
    } catch (err) {
      notify(getErrorMessage(err, t('company.notifyCreateError')), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
            <Avatar
              variant="rounded"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', width: 44, height: 44 }}
            >
              <WarehouseRoundedIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ lineHeight: 1.2 }}>
                {t('app.title')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap>
                {t('app.subtitle')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={i18n.language.startsWith('en') ? 'en' : 'tr'}
                onChange={handleLanguageChange}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.14)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    color: '#fff',
                    border: 'none',
                    px: 1.5,
                    py: 0.5,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  },
                  '& .Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.28) !important',
                  },
                }}
              >
                <ToggleButton value="tr">TR</ToggleButton>
                <ToggleButton value="en">EN</ToggleButton>
              </ToggleButtonGroup>

              <BusinessRoundedIcon fontSize="small" sx={{ opacity: 0.9 }} />
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}
              >
                {t('header.company')}
              </Typography>
              <FormControl size="small">
                <Select
                  value={companyId ?? ''}
                  onChange={handleCompanyChange}
                  displayEmpty
                  disabled={companiesLoading}
                  variant="outlined"
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.14)',
                    borderRadius: 2,
                    minWidth: 170,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSvgIcon-root': { color: '#fff' },
                    fontWeight: 600,
                  }}
                  renderValue={(selected) => {
                    if (!selected) return t('company.select');
                    const company = companies.find((c) => c.code === selected);
                    return company?.name ?? selected;
                  }}
                >
                  <MenuItem value="" disabled>
                    {t('company.select')}
                  </MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.code}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setFormOpen(true)}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.5)',
                  whiteSpace: 'nowrap',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {t('company.addButton')}
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <CompanyFormDialog
        open={formOpen}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={(input) => void handleCreateCompany(input)}
      />
    </>
  );
}
