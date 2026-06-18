import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { CompanyProvider } from './context/CompanyContext';
import { SnackbarProvider } from './context/SnackbarContext';
import App from './App';
import './i18n';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element bulunamadı.');

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <CompanyProvider>
          <App />
        </CompanyProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>,
);
