# SmartWarehouse — Çalışma Raporu

**Proje:** Akıllı Depo Yönetim Sistemi (SmartWarehouse)  
**Tarih:** 18 Haziran 2026  
**Geliştirici:** Alim Delibaş

---

## 1. Proje Özeti

SmartWarehouse, çok kiracılı (multi-tenant) bir depo yönetim uygulamasıdır. Backend .NET 9 Web API ile katmanlı mimaride geliştirilmiş; frontend React 18 + TypeScript + MUI ile tek sayfalık (SPA) bir arayüz sunar.

Temel iş akışı:

1.Şirket seçimi yapılır eğer şirket yoksa yeni şirket oluşturulur ve işleme devam edilir.

2. Sisteme ürün tanımlanır.
   
3. Tanımlanan ürün depoya giriş yapar (stok artışı).
   
4. Depodaki ürün depodan çıkış yapar (stok azalışı).
   

Tüm operasyonel veriler `CompanyId` bazında ayrılır; silme işlemleri fiziksel değil **soft delete** (`IsDeleted`) ile yapılır. Şirket tanımları `Companies` tablosunda tutulur; kullanıcı Header üzerinden şirket seçer veya yeni şirket ekler.

---

## 2. Kullanılan Teknolojiler ve Sürümler

| Katman | Teknoloji | Sürüm |
|--------|-----------|-------|
| Runtime | .NET SDK | 9.0 |
| Backend | ASP.NET Core Web API | 9.0 |
| OpenAPI | Microsoft.AspNetCore.OpenApi | 9.0.16 |
| ORM | Entity Framework Core | 9.0.17 |
| Veritabanı | Microsoft SQL Server | LocalDB / SQL Server Express |
| Frontend | React | 18.3.1 |
| Frontend | TypeScript | 5.6.3 |
| UI | Material UI (MUI) | 6.1.10 |
| Tablo | MUI X Data Grid | 7.23.1 |
| Grafik | Recharts | 3.8.1 |
| Çoklu dil | i18next | 26.3.1 |
| Çoklu dil | react-i18next | 17.0.8 |
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

- **Controller:** HTTP endpoint'leri, `CompanyId` doğrulaması (tenant verileri için), yanıt zarfı (`ApiResponseDto<T>`).
- **Manager:** İş kuralları, sayfalama, 403/404 kararları.
- **Repository:** EF Core sorguları; güncellemede `EntityState.Modified` zorunlu.
- **Entity:** `BaseEntity` üzerinden `Id`, `CompanyId`, `IsDeleted`, `CreatedAt`, `UpdatedAt`.

### 3.2 Multi-Tenant (CompanyId)

- Operasyonel entity'ler (`Product`, `WarehouseLocation`, `Stock`, `StockMovement`) ve `Company` kayıtları `BaseEntity`'den türer.
- Tenant verisi taşıyan endpoint'lerde `CompanyId` eksik → **400 Bad Request**.
- Kayıt farklı şirkete ait → **403 Forbidden**.
- Sorgular tenant verilerinde her zaman `CompanyId` filtresi ile yapılır.

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
- Şirketler: metin araması (sayfalı liste).

### 3.5 Şirket (Company) Yönetimi

- `Companies` tablosu: `Code` (benzersiz tenant kodu), `Name`.
- `CompaniesController`: listeleme, sayfalı listeleme, oluşturma, güncelleme, soft delete.
- Frontend `CompanyContext`: uygulama açılışında şirketler API'den yüklenir; başlangıçta seçili şirket **null** olabilir.
- Geçerli seçim `localStorage`'da saklanır; Header'daki seçici ve "Yeni Şirket" butonu ile yönetilir.

### 3.6 Frontend Mimarisi

- Tek sayfa (`App.tsx`): özet kartlar, stok hareket grafiği, sekmeli yapı (Ürünler / Lokasyonlar / Stok-Hareketler).
- `CompanyContext`: dinamik şirket listesi, seçim ve oluşturma.
- `usePagedData` hook: server-side pagination (DataGrid 0-tabanlı → API 1-tabanlı dönüşüm).
- PascalCase/camelCase uyumu: `client.ts` içinde casing-bağımsız parser.
- `react-i18next`: Türkçe / İngilizce dil desteği (Header'da dil seçici).

---

## 4. API End-Pointleri

ASP.NET Core route eşleştirmesi büyük/küçük harfe duyarsızdır. Aşağıdaki yollar küçük harf convention ile gösterilmiştir.

### Companies — `/api/companies`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/` | Tüm şirketler (liste) |
| GET | `/paged?page&pageSize&search` | Sayfalı şirket listesi |
| POST | `/create` | Yeni şirket |
| POST | `/update` | Güncelleme |
| POST | `/delete` | Soft delete |

### Products — `/api/products`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/paged?companyId&page&pageSize&search&category` | Sayfalı liste |
| GET | `/by-company/{companyId}` | Şirkete ait tüm ürünler |
| GET | `/{id}?companyId` | Tekil kayıt |
| POST | `/create` | Yeni ürün |
| POST | `/update` | Güncelleme |
| POST | `/delete` | Soft delete |

### WarehouseLocations — `/api/warehouselocations`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/paged?companyId&page&pageSize&search` | Sayfalı liste |
| GET | `/by-company/{companyId}` | Şirkete ait tüm lokasyonlar |
| GET | `/{id}?companyId` | Tekil kayıt |
| POST | `/create` | Yeni lokasyon |
| POST | `/update` | Güncelleme |
| POST | `/delete` | Soft delete |

### Stocks — `/api/stocks`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/paged?companyId&page&pageSize&search&warehouseLocationId` | Stok seviyeleri |
| GET | `/movements/paged?companyId&page&pageSize&search&type` | Stok hareketleri |
| GET | `/movements/chart?companyId` | Son 7 gün hareket grafiği verisi |
| GET | `/summary?companyId` | Özet istatistikler |
| POST | `/movement` | Giriş/çıkış hareketi |

---

## 5. Veritabanı ve Migration

### Migration'lar

| Migration | Dosya | İçerik |
|-----------|-------|--------|
| `InitialCreate` | `20260618091659_InitialCreate.cs` | Products, WarehouseLocations, Stocks, StockMovements |
| `AddCompaniesTable` | `20260618123429_AddCompaniesTable.cs` | Companies tablosu + `Code` unique index |

Konum: `SmartWarehouse.Api/Migrations/`

> Not: Önceki `InitialCreated` migration'ı kaldırılmıştır; geçerli migration zinciri yalnızca yukarıdaki iki adımdan oluşur.

### Tablolar

- `Products`
- `WarehouseLocations`
- `Stocks` — `(ProductId, WarehouseLocationId, CompanyId)` unique index
- `StockMovements`
- `Companies` — `Code` unique index

### Connection String Yapılandırması

| Dosya | Durum | Açıklama |
|-------|-------|----------|
| `appsettings.json` | Repoda | Connection string **yok** (yalnızca Logging / AllowedHosts) |
| `appsettings.Development.json` | `.gitignore` | Geliştirici ortamında gerçek connection string |
| `appsettings.example.json` | Repoda | Şablon; `DefaultConnection` boş bırakılır |

Örnek connection string (geliştirme):

```
Server=(localdb)\MSSQLLocalDB;Database=SmartWarehouseDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Veritabanı adı: **SmartWarehouseDb**

Veritabanı otomatik oluşturulmaz; ilk kurulumda migration uygulanmalıdır:

```powershell
cd SmartWarehouse.Api
dotnet ef database update
```

---

## 6. Frontend Özellikleri

| Gereksinim | Durum | Uygulama |
|------------|-------|----------|
| React 18 + TS + MUI | Tamamlandı | `frontend/` |
| Tek sayfa (SPA) | Tamamlandı | `App.tsx` |
| Özet kartlar | Tamamlandı | `SummaryCards.tsx` (4 KPI) |
| Stok hareket grafiği | Tamamlandı | `StockMovementChart.tsx` (Recharts) |
| Sayfalanmış tablo | Tamamlandı | MUI DataGrid + `usePagedData` |
| Ekle/düzenle modal | Tamamlandı | `ProductFormDialog`, `LocationFormDialog`, `StockMovementDialog`, `CompanyFormDialog` |
| Silme onay modal | Tamamlandı | `ConfirmDialog.tsx` |
| Server-side pagination | Tamamlandı | Varsayılan 25 kayıt/sayfa |
| Şirket seçici | Tamamlandı | `Header.tsx` + `CompanyContext` |
| Çoklu dil (TR/EN) | Tamamlandı | `i18n/index.ts`, `react-i18next` |

Şirket seçilmeden tenant verisi gerektiren sekmeler boş/uyarı durumunda kalır; özet kartlar ve grafik de seçili şirkete bağlıdır.

---

## 7. Karşılaşılan Sorunlar ve Çözümler

| Sorun | Çözüm |
|-------|-------|
| Backend PascalCase JSON, frontend camelCase bekliyor | `client.ts` içinde `field()`, `unwrap()`, `unwrapPaged()` ile casing-bağımsız parser |
| DataGrid 0-tabanlı sayfa, API 1-tabanlı | `usePagedData` hook'ta istek anında `page + 1` gönderimi |
| Stok hareketi filtrelemede enum 400 hatası | `Program.cs` içinde `JsonStringEnumConverter` eklendi; `type=In/Out` query parametreleri doğru parse ediliyor |
| CORS (frontend → backend) | `Program.cs` içinde `localhost:5173` ve `localhost:3000` origin'leri tanımlandı |
| HTTPS yönlendirme Development'ta sorun çıkardı | `UseHttpsRedirection()` yalnızca Production ortamında etkin |
| Connection string güvenliği | Gerçek bağlantı bilgisi `appsettings.Development.json`'da (gitignore); repoda yalnızca `appsettings.example.json` şablonu |
| Veritabanı oluşturma | Otomatik oluşturma yok; `dotnet ef database update` ile migration uygulanır |
| EF migration adı çakışması | `InitialCreated` kaldırıldı; `InitialCreate` + `AddCompaniesTable` zinciri kullanılıyor |
| Stok çıkışında yetersiz miktar | `StockManager.ApplyMovementAsync` içinde mevcut stok kontrolü, 400 döner |
| npm `devdir` uyarısı | Ortam değişkeni kaynaklı uyarı; build'i etkilemiyor |

---

## 8. Yapay Zeka Kullanım Aşamaları

Proje geliştirme sürecinde Cursor AI agent'ları aşağıdaki aşamalarda kullanılmıştır:

1. **Frontend iskeleti:** React konusundaki deneyim sınırlı olduğu ve teslim süresi kısıtlı olduğu için özet kartlar, sekmeli layout, DataGrid tabloları, form ve onay modalları Cursor desteğiyle oluşturuldu.
2. **Entegrasyon ve altyapı:** CORS yapılandırması, `usePagedData` pagination hook'u, JSON casing parser ve hata mesajı yönetimi gibi teknik noktalarda Cursor'dan yardım alındı.
3. **Backend PDF uyumu:** Controller route/metot düzenlemeleri, CompanyId validasyonu, server-side pagination ve EF Core migration adımlarında AI destekli geliştirme yapıldı.
4. **Ek özellikler:** i18n altyapısı, stok hareket grafiği ve dinamik şirket yönetimi (Header + CompanyContext) geliştirmesinde AI kullanıldı.

Tüm kod ve mimari kararlar geliştirici tarafından gözden geçirilmiş; kullanılan teknolojilerin anlaşılması hedeflenmiştir.

---

## 9. Derleme Sonuçları (18.06.2026)

### Backend

```powershell
dotnet build SmartWarehouse.Api/SmartWarehouse.Api.csproj
```

**Sonuç:** Başarılı — 0 uyarı, 0 hata

### Frontend

```powershell
cd frontend
npm run build
```

**Sonuç:** Başarılı — TypeScript derlemesi ve Vite production build tamamlandı

---

## 10. Çalıştırma Talimatları

### Ön koşullar

- .NET 9 SDK
- Node.js 24.x + npm
- SQL Server veya LocalDB çalışır durumda

### Backend

1. `SmartWarehouse.Api/appsettings.example.json` dosyasını referans alarak `appsettings.Development.json` oluşturun ve `DefaultConnection` değerini doldurun (`Database=SmartWarehouseDb`).
2. Migration'ları uygulayın:

```powershell
cd SmartWarehouse.Api
dotnet ef database update
dotnet run
```

3. API adresi: **http://localhost:5083** (`launchSettings.json` — `http` profili)

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Arayüz: **http://localhost:5173**

`.env` dosyasında `VITE_API_BASE_URL=http://localhost:5083/api` tanımlı olmalıdır.

---

## 11. OpenAPI / API Dokümantasyonu

Backend, ASP.NET Core OpenAPI desteği kullanır. Tam Swagger UI yerine OpenAPI JSON endpoint'i sunulur:

| Ortam | Adres |
|-------|-------|
| Development | http://localhost:5083/openapi/v1.json |

`MapOpenApi()` yalnızca Development ortamında etkindir.

---

## 12. Proje Dizin Yapısı

```
SmartWarehouse/
├── CALISMA_RAPORU.md
├── SmartWarehouse.Api/
│   ├── Controllers/
│   │   ├── ApiControllerBase.cs
│   │   ├── CompaniesController.cs
│   │   ├── ProductsController.cs
│   │   ├── StocksController.cs
│   │   └── WarehouseLocationsController.cs
│   ├── Managers/
│   ├── Repositories/
│   ├── Entities/
│   │   ├── BaseEntity.cs
│   │   ├── Company.cs
│   │   ├── Product.cs
│   │   ├── Stock.cs
│   │   ├── StockMovement.cs
│   │   └── WarehouseLocation.cs
│   ├── Dtos/
│   ├── Data/
│   ├── Migrations/
│   ├── Common/
│   ├── Properties/launchSettings.json
│   ├── appsettings.json
│   ├── appsettings.example.json
│   └── Program.cs
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── features/
    │   │   ├── companies/
    │   │   ├── products/
    │   │   ├── locations/
    │   │   └── stocks/
    │   ├── hooks/
    │   ├── i18n/
    │   └── types/
    └── package.json
```

---

## 13. Projede İstenilenler Dışında Yapılanlar

Geliştirme testi dökümanının zorunlu kapsamının ötesinde aşağıdaki iyileştirmeler eklendi:

1. **Çoklu dil (i18n):** `react-i18next` ile Türkçe ve İngilizce arayüz desteği; Header'da dil seçici.
2. **Stok hareket grafiği:** Son 7 günlük giriş/çıkış verisi `GET /api/stocks/movements/chart` endpoint'inden alınır; `StockMovementChart.tsx` (Recharts) ile görselleştirilir.
3. **Dinamik şirket yönetimi:** Sabit `company-1` yerine şirketler veritabanından yüklenir; başlangıçta seçim null olabilir; Header üzerinden şirket seçimi ve yeni şirket ekleme (`CompanyFormDialog`) sağlanır.

---

## 14. Zaman Kısıtı Nedeniyle Kapsam Dışında Bırakılan Geliştirmeler

Proje kapsamında temel depo yönetimi, ürün/lokasyon/stok/hareket yönetimi, multi-tenant veri ayrımı, soft delete, server-side pagination, React tabanlı arayüz ve raporlama bileşenleri tamamlanmıştır.

Ek olarak sisteme JWT tabanlı kimlik doğrulama, kullanıcı girişi ve rol bazlı yetkilendirme yapısının eklenmesi planlanmıştır. Bu yapı ile kullanıcıların sisteme güvenli şekilde giriş yapması, token üzerinden oturum yönetimi yapılması ve Admin / Kullanıcı gibi rollerle API endpoint'lerine erişimin sınırlandırılması hedeflenmiştir.

Ancak proje teslim süresi öncelikleri nedeniyle JWT authentication ve role-based authorization geliştirmesi bu sürüme dahil edilmemiştir.

---

## Ek: PDF Gereksinimlerine Uyum Kontrol Listesi

| PDF Gereksinimi | Durum |
|-----------------|-------|
| .NET 9 Web API backend | ✅ |
| React 18 + TypeScript + MUI frontend | ✅ |
| MS SQL Server + EF Core | ✅ |
| Katmanlı mimari (Controller → Manager → Repository → Entity) | ✅ |
| Temel senaryo: ürün tanımlama, depoya giriş, depodan çıkış | ✅ |
| Her entity'de `CompanyId` (multi-tenant) | ✅ |
| Soft delete (`IsDeleted`) | ✅ |
| Server-side pagination (varsayılan 25) + arama/filtre | ✅ |
| EF Core Migration ile şema | ✅ (`InitialCreate`, `AddCompaniesTable`) |
| Frontend tek sayfa | ✅ |
| Özet kartlar, sayfalanmış tablo, ekle/düzenle/silme modalları | ✅ |
| PUT/DELETE yasak — POST create/update/delete | ✅ |
| CompanyId eksik → 400, uyuşmazlık → 403 | ✅ |
| Raw SQL yasak — yalnızca EF Core | ✅ |
| Güncellemede `EntityState.Modified` | ✅ |
| PascalCase (C#) / camelCase (TS) naming | ✅ |
| `CALISMA_RAPORU.md` teslimi | ✅ |

<img width="2481" height="1298" alt="image" src="https://github.com/user-attachments/assets/cb6006be-b032-4de2-8892-a636484615e4" />
<img width="2471" height="1297" alt="image" src="https://github.com/user-attachments/assets/6b2c8156-c14a-4596-87bd-9ad2ade7986a" />
<img width="2426" height="1271" alt="image" src="https://github.com/user-attachments/assets/387159a5-4b32-40bc-b149-108fbeafdbbc" />
<img width="2517" height="1251" alt="image" src="https://github.com/user-attachments/assets/3af3b88d-4f0f-4fc5-a0ce-623b5f149ab4" />



