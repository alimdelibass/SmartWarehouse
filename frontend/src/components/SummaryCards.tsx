import { useMemo } from 'react';
import { Box, Card, CardContent, Skeleton, Typography, alpha } from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { StockSummary } from '../types';

interface SummaryCardsProps {
  summary: StockSummary | null;
  loading: boolean;
}

interface CardConfig {
  key: keyof StockSummary;
  labelKey: string;
  icon: SvgIconComponent;
  color: string;
}

const CARDS: CardConfig[] = [
  {
    key: 'totalProducts',
    labelKey: 'summary.totalProducts',
    icon: Inventory2RoundedIcon,
    color: '#2563eb',
  },
  {
    key: 'totalLocations',
    labelKey: 'summary.totalLocations',
    icon: WarehouseRoundedIcon,
    color: '#7c3aed',
  },
  {
    key: 'totalStockQuantity',
    labelKey: 'summary.totalStockQuantity',
    icon: LayersRoundedIcon,
    color: '#16a34a',
  },
  {
    key: 'lowStockCount',
    labelKey: 'summary.lowStockCount',
    icon: WarningAmberRoundedIcon,
    color: '#f59e0b',
  },
];

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const { t, i18n } = useTranslation();
  const numberLocale = useMemo(
    () => (i18n.language.startsWith('en') ? 'en-US' : 'tr-TR'),
    [i18n.language],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {CARDS.map(({ key, labelKey, icon: Icon, color }) => {
        const value = summary ? summary[key] : 0;
        const isAlert = key === 'lowStockCount' && value > 0;
        return (
          <Card key={key} sx={{ borderColor: isAlert ? alpha(color, 0.5) : undefined }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(color, 0.12),
                  color,
                  flexShrink: 0,
                }}
              >
                <Icon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {t(labelKey)}
                </Typography>
                {loading ? (
                  <Skeleton width={64} height={36} />
                ) : (
                  <Typography variant="h4" sx={{ color: isAlert ? color : 'text.primary' }}>
                    {value.toLocaleString(numberLocale)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
