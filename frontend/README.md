# Akıllı Depo Yönetimi — Frontend

SmartWarehouse .NET 9 Web API için **React 18 + TypeScript + Material-UI (MUI)** ile geliştirilmiş tek sayfa (single page) yönetim paneli. Vite ile derlenir.

## Teknolojiler

- Vite 6 + React 18 + TypeScript 5
- Material-UI v6 (`@mui/material`, `@mui/icons-material`, `@emotion/*`)
- MUI X DataGrid v7 (`@mui/x-data-grid`) — server-side pagination
- axios

## Kurulum & Çalıştırma

```bash
cd frontend
npm install
npm run dev      # geliştirme sunucusu (http://localhost:5173)
npm run build    # tsc -b && vite build (üretim derlemesi)
npm run preview  # üretim derlemesini önizler
```

## API Adresi Yapılandırması

Tek yerden `.env` dosyası ile yönetilir:

```
VITE_API_BASE_URL=http://localhost:5083/api
VITE_API_PROXY_TARGET=http://localhost:5083
```

- `VITE_API_BASE_URL`: axios `baseURL`. Backend farklı bir porta taşınırsa burayı değiştirin.
- Alternatif olarak `VITE_API_BASE_URL=/api` yaparsanız istekler Vite dev sunucusunun
  proxy'si üzerinden `VITE_API_PROXY_TARGET` hedefine gider (CORS sorunlarını önler).

Backend `Properties/launchSettings.json` dosyasında `http://localhost:5083` (http) ve
`https://localhost:7200` (https) portlarında açılır.

## Yapı

```
src/
  api/            axios istemcisi + endpoint katmanı (products, locations, stocks)
  components/     Header, SummaryCards, ConfirmDialog, DataGrid yapılandırması
  context/        CompanyContext (multi-tenant), SnackbarContext (bildirim)
  features/
    products/     ProductsTab + ProductFormDialog
    locations/    LocationsTab + LocationFormDialog
    stocks/       StocksTab + StockMovementDialog
  hooks/          usePagedData (server-side pagination), useDebounce
  types/          TypeScript tipleri
  utils/          tarih formatlama
  theme.ts        MUI teması
  App.tsx         özet kartları + sekmeler
```

## Mimari Notlar

- **Naming:** Frontend camelCase kullanır. Request body'ler backend'e **PascalCase**
  gönderilir (`{ CompanyId, Name, Sku }`). Response'lar `api/client.ts` içindeki
  casing-bağımsız mapper'lar ile camelCase'e dönüştürülür (hem PascalCase hem camelCase
  cevapları tolere eder).
- **Multi-tenant:** Üstteki şirket seçici bir `companyId` state'i tutar (varsayılan
  `COMPANY-A`). Tüm GET isteklerine `?companyId=` query'si, POST'lara body içinde
  `CompanyId` eklenir.
- **Server-side pagination:** `usePagedData` hook'u her sayfa/boyut/arama/filtre
  değişiminde backend'e `page`, `pageSize`, `search` parametreleriyle yeni istek atar
  (varsayılan sayfa boyutu 25).
