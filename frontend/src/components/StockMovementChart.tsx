import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { stocksApi } from '../api';
import type { StockMovementChartItem } from '../types';
import { formatShortDate } from '../utils/format';

interface StockMovementChartProps {
  companyId: string;
  refreshKey?: number;
}

export default function StockMovementChart({ companyId, refreshKey = 0 }: StockMovementChartProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [data, setData] = useState<StockMovementChartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChart = useCallback(async () => {
    setLoading(true);
    try {
      const items = await stocksApi.getMovementChart(companyId);
      setData(items);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadChart();
  }, [loadChart, refreshKey]);

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        label: formatShortDate(item.date, i18n.language),
      })),
    [data, i18n.language],
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('chart.title')}
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" height={280} />
        ) : chartData.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('chart.noData')}</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: { xs: 280, md: 320 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  interval={isMobile ? 1 : 0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: t('chart.quantity'),
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12 },
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    Number(value ?? 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'tr-TR'),
                    name === 'inQuantity' ? t('chart.inQuantity') : t('chart.outQuantity'),
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === 'inQuantity' ? t('chart.inQuantity') : t('chart.outQuantity')
                  }
                />
                <Bar dataKey="inQuantity" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outQuantity" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
