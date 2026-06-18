import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import StockMovementChart from './components/StockMovementChart';
import ProductsTab from './features/products/ProductsTab';
import LocationsTab from './features/locations/LocationsTab';
import StocksTab from './features/stocks/StocksTab';
import { stocksApi } from './api';
import type { StockSummary } from './types';
import { useCompany } from './context/CompanyContext';

export default function App() {
  const { t } = useTranslation();
  const { companyId } = useCompany();
  const [tab, setTab] = useState(0);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!companyId) {
      setSummary(null);
      return;
    }

    setSummaryLoading(true);
    try {
      const data = await stocksApi.getSummary(companyId);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [companyId]);

  const handleDataChanged = useCallback(() => {
    void loadSummary();
    setChartRefreshKey((key) => key + 1);
  }, [loadSummary]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {!companyId ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              py: { xs: 6, md: 10 },
              px: 3,
              textAlign: 'center',
              bgcolor: '#f8fafc',
            }}
          >
            <BusinessRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t('empty.noCompanyTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={480} mx="auto">
              {t('empty.noCompany')}
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <SummaryCards summary={summary} loading={summaryLoading} />
            </Box>

            <StockMovementChart companyId={companyId} refreshKey={chartRefreshKey} />

            <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Tabs
                value={tab}
                onChange={(_, value: number) => setTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: '#f8fafc',
                }}
              >
                <Tab
                  icon={<Inventory2RoundedIcon />}
                  iconPosition="start"
                  label={t('app.tabs.products')}
                />
                <Tab
                  icon={<WarehouseRoundedIcon />}
                  iconPosition="start"
                  label={t('app.tabs.locations')}
                />
                <Tab
                  icon={<LayersRoundedIcon />}
                  iconPosition="start"
                  label={t('app.tabs.stocks')}
                />
              </Tabs>

              <Box sx={{ p: { xs: 2, md: 3 } }}>
                {tab === 0 && <ProductsTab onDataChanged={handleDataChanged} />}
                {tab === 1 && <LocationsTab onDataChanged={handleDataChanged} />}
                {tab === 2 && <StocksTab onDataChanged={handleDataChanged} />}
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}
