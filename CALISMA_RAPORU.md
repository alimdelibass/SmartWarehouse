# SmartWarehouse — Çalışma Raporu

**Proje:** Akıllı Depo Yönetim Sistemi (SmartWarehouse)  
**Tarih:** 18 Haziran 2026  
**Geliştirici:** Alim Delibaş

---

## 1. Proje Özeti

SmartWarehouse, (multi-tenant) bir depo yönetim uygulamasıdır. Backend .NET 9 Web API ile katmanlı mimaride geliştirilmiş; frontend React 18 + TypeScript + MUI ile tek sayfalık (SPA) bir arayüz sunar. Tüm veriler `CompanyId` bazında ayrılır; silme işlemleri fiziksel değil **soft delete** (`IsDeleted`) ile yapılır.

---

## 2. Kullanılan Teknolojiler ve Sürümler

| Katman | Teknoloji | Sürüm |
|--------|-----------|-------|
| Runtime | .NET SDK | .net9 |
| Backend | ASP.NET Core Web API | 9.0 |
| ORM | Entity Framework Core | 9.0.17 |
| Veritabanı | Microsoft SQL Server | LocalDB / SQL Server Express |
| Frontend | React | 18.3.1 |
| Frontend | TypeScript | 5.6.3 |
| UI | Material UI (MUI) | 6.1.10 |
| Tablo | MUI X Data Grid | 7.23.1 |
| Build (FE) | Vite | 6.0.3 |
| HTTP | Axios | 1.7.9 |
| Node.js | — | 24.12.0 |
| npm | — | 11.6.2 |

---

## 3. Mimari Kararlar

### 3.1 Katmanlı Mimari

```
Controller → Manager → Repository → Entity
                ↓
         WarehouseDbContext (EF Core)
```

- **Controller:** HTTP end-point noktaları, `CompanyId` doğrulaması, yanıt zarfı (`ApiResponseDto<T>`).
- **Manager:** İş kuralları, sayfalama, 403/404 kararları.
- **Repository:** EF Core sorguları; güncellemede `EntityState.Modified` zorunlu.
- **Entity:** `BaseEntity` üzerinden `Id`, `CompanyId`, `IsDeleted`, `CreatedAt`, `UpdatedAt`.

### 3.2 Multi-Tenant (CompanyId)

- Tüm entity'ler (`Product`, `WarehouseLocation`, `Stock`, `StockMovement`) `BaseEntity`'den türer.
- `CompanyId` eksik → **400 Bad Request**.
- Kayıt farklı şirkete ait → **403 Forbidden**.
- Sorgular her zaman `CompanyId` filtresi ile yapılır.

### 3.3 Soft Delete

- Global query filter: `HasQueryFilter(e => !e.IsDeleted)`.
- Silme: `IsDeleted = true` + `EntityState.Modified`.
- PUT/DELETE HTTP metotları **kullanılmaz**; güncelleme/silme `POST update` / `POST delete` ile yapılır.

### 3.4 Sayfalama ve Filtreleme

- Varsayılan sayfa boyutu: **25**.
- Server-side pagination (`Skip` / `Take`).
- Ürünler: metin araması + kategori filtresi.
- Lokasyonlar: metin araması.
- Stoklar: metin araması + lokasyon filtresi.
- Hareketler: metin araması + hareket tipi (In/Out).
- 
### 3.6 Frontend Mimarisi

- Tek sayfa (`App.tsx`): özet kartlar + sekmeli (Ürünler / Lokasyonlar / Stok-Hareketler) yapı.
- `CompanyContext`: aktif şirket kimliği (varsayılan `company-1`).
- `usePagedData` hook: server-side pagination (DataGrid 0-tabanlı → API 1-tabanlı dönüşüm).
- PascalCase/camelCase uyumu: `client.ts` içinde casing-bağımsız parser.

---

## 4. API End-Pointleri

### Products — `/api/Products`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `paged?companyId&page&pageSize&search&category` | Sayfalı liste |
| GET | `by-company/{companyId}` | Şirkete ait tüm ürünler |
| GET | `{id}?companyId` | Tekil kayıt |
| POST | `create` | Yeni ürün |
| POST | `update` | Güncelleme |
| POST | `delete` | Soft delete |

### WarehouseLocations — `/api/WarehouseLocations`

Aynı desen (paged, by-company, get by id, create/update/delete).

### Stocks — `/api/Stocks`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `paged?companyId&page&pageSize&search&warehouseLocationId` | Stok seviyeleri |
| GET | `movements/paged?companyId&page&pageSize&search&type` | Stok hareketleri |
| GET | `summary?companyId` | Özet istatistikler |
| POST | `movement` | Giriş/çıkış hareketi |

---

## 5. Veritabanı ve Migration

- Migration adı: `20260618091659_InitialCreated`
- Konum: `SmartWarehouse.Api/Migrations/`
- Tablolar: `Products`, `WarehouseLocations`, `Stocks`, `StockMovements`
- `Stocks` tablosunda `(ProductId, WarehouseLocationId, CompanyId)` unique index.

**Connection string** (`appsettings.json`):

```
Server=(localdb)\\MSSQLLocalDB;Database=SmartVarehouseDb;Trusted_Connection=True;TrustServerCertificate=True;
```

```
## 6. Frontend Özellikleri

| Gereksinim | Durum | Uygulama |
|------------|-------|----------|
| React 18 + TS + MUI  | `frontend/` |
| Tek sayfa  | `App.tsx` |
| Özet kartlar  | `SummaryCards.tsx` (4 KPI) |
| Paginated tablo | MUI DataGrid + `usePagedData` |
| Ekle/düzenle modal  | `ProductFormDialog`, `LocationFormDialog`, `StockMovementDialog` |
| Silme onay modal  | `ConfirmDialog.tsx` |
| Server-side pagination  | Varsayılan 25 kayıt/sayfa |

```
## 7. Karşılaşılan Sorunlar ve Çözümler

| Sorun | Çözüm |
|-------|-------|
| Backend PascalCase JSON, frontend camelCase bekliyor | `client.ts` içinde `field()`, `unwrap()`, `unwrapPaged()` ile casing-bağımsız parser |
| DataGrid 0-tabanlı sayfa, API 1-tabanlı | `usePagedData` hook'ta istek anında `page + 1` gönderimi |
| EF migration adı çakışması | Önceki oturumda `InitialCreated` zaten oluşturulmuş; yeniden eklemeye gerek kalmadı |
| CORS (frontend → backend) | `Program.cs` içinde `localhost:5173` ve `localhost:3000` origin'leri tanımlandı | 
| Stok çıkışında yetersiz miktar | `StockManager.ApplyMovementAsync` içinde mevcut stok kontrolü, 400 döner |
| npm `devdir` uyarısı | Ortam değişkeni kaynaklı uyarı; build'i etkilemiyor |

```
```
## 8. AI Kullanım Aşamaları

Proje geliştirme sürecinde Cursor AI agent'ları aşağıdaki aşamalarda kullanılmıştır:

1. FrontEnd tarafında React üzerinde çok bilgim olmadığı ve projeyi zamanında yetiştirmek için Özet kartlar, sekmeli layout, DataGrid tabloları, form ve onay modallarını Cursor'dan destek aldım
2. CORS, pagination hook, casing parser ve hata mesajı yönetiminı de gerekli yerleri yine cursordan destek alarak ilerledim.
```
```
## 9. Derleme Sonuçları (18.06.2026)
### Backend
**Sonuç:**  Başarılı — 0 uyarı, 0 hata

### Frontend

npm run build

**Sonuç:**  Başarılı — TypeScript derlemesi ve Vite production build tamamlandı
```
```
> SQL Server'ın çalışır durumda olduğundan emin olun. İlk çalıştırmada `SmartVarehouseDb` veritabanı otomatik oluşturulur.

```
API adresi: http://localhost:5083 
Swagger (Development): http://localhost:5083/openapi/v1.json
Arayüz: http://localhost:5173
```
```
12. Proje Dizin Yapısı

SmartWarehouse/
├── CALISMA_RAPORU.md
├── SmartWarehouse.Api/
│   ├── Controllers/
│   ├── Managers/
│   ├── Repositories/
│   ├── Entities/
│   ├── Dtos/
│   ├── Data/
│   ├── Migrations/
│   ├── Common/
│   └── Program.cs
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── features/
    │   ├── hooks/
    │   └── types/
    └── package.json
```
```
13.Pojede istenilenler dışında yapılanlar

1. React-i18next ile TR/EN çoklu dil yapısı eklendi. Sayfaya İngilizce ve türkçe Dil Desteği eklendi.
2. Son 7 Gün Stok Hareketleri grafiği eklendi.
```
```
14.Zaman Kısıtı Nedeniyle Kapsam Dışında Bırakılan Geliştirmeler

Proje kapsamında temel depo yönetimi, ürün/lokasyon/stok/hareket yönetimi, multi-tenant veri ayrımı, soft delete, server-side pagination, React tabanlı arayüz ve raporlama bileşenleri tamamlanmıştır.

Ek olarak sisteme JWT tabanlı kimlik doğrulama, kullanıcı girişi ve rol bazlı yetkilendirme yapısının eklenmesi planlanmıştır. Bu yapı ile kullanıcıların sisteme güvenli şekilde giriş yapması, token üzerinden oturum yönetimi yapılması ve Admin / Kullanıcı gibi rollerle API end-point noktalarına erişimin sınırlandırılması hedeflenmiştir.

Ancak proje teslim süresi öncelikleri nedeniyle JWT authentication ve role-based authorization geliştirmesi bu sürüme dahil edilmemiştir.
