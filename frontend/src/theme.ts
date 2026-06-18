import { createTheme, alpha } from '@mui/material/styles';
import '@mui/x-data-grid/themeAugmentation';

const PRIMARY = '#2563eb';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: PRIMARY, light: '#60a5fa', dark: '#1d4ed8' },
    secondary: { main: '#7c3aed' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    info: { main: '#0ea5e9' },
    background: { default: '#f1f5f9', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: -0.5 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(1200px 600px at 100% -10%, rgba(37,99,235,0.08), transparent 60%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(90deg, ${PRIMARY}, #1e3a8a)`,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          backgroundColor: '#fff',
          '--DataGrid-containerBackground': '#f8fafc',
        },
        columnHeaders: { fontWeight: 700 },
        columnHeaderTitle: { fontWeight: 700 },
        row: {
          '&:hover': { backgroundColor: alpha(PRIMARY, 0.04) },
        },
      },
    },
  },
});
