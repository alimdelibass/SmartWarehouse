using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Dtos.Stocks;
using SmartWarehouse.Api.Entities;
using SmartWarehouse.Api.Enums;
using SmartWarehouse.Api.Repositories;

namespace SmartWarehouse.Api.Managers;

public class StockManager
{
    private const int LowStockThreshold = 10;

    private readonly StockRepository _stockRepository;
    private readonly StockMovementRepository _stockMovementRepository;
    private readonly WarehouseDbContext _context;

    public StockManager(
        StockRepository stockRepository,
        StockMovementRepository stockMovementRepository,
        WarehouseDbContext context)
    {
        _stockRepository = stockRepository;
        _stockMovementRepository = stockMovementRepository;
        _context = context;
    }

    public async Task<PagedResultDto<StockDto>> GetStocksPagedAsync(
        string companyId, int page, int pageSize, string? search, int? warehouseLocationId)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 25;

        var query = _stockRepository.Query(companyId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(s => s.Product.Name.Contains(search));

        if (warehouseLocationId.HasValue)
            query = query.Where(s => s.WarehouseLocationId == warehouseLocationId.Value);

        var totalCount = await query.CountAsync();

        var entities = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<StockDto>
        {
            Items = entities.Select(ToStockDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResultDto<StockMovementDto>> GetMovementsPagedAsync(
        string companyId, int page, int pageSize, string? search, StockMovementType? type)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 25;

        var query = _stockMovementRepository.Query(companyId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m => m.Product.Name.Contains(search));

        if (type.HasValue)
            query = query.Where(m => m.Type == type.Value);

        var totalCount = await query.CountAsync();

        var entities = await query
            .OrderByDescending(m => m.TransactionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<StockMovementDto>
        {
            Items = entities.Select(ToMovementDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<StockMovementChartItemDto>> GetMovementChartAsync(string companyId)
    {
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-6);

        var totals = await _stockMovementRepository.GetDailyTotalsAsync(companyId, startDate, endDate);

        var result = new List<StockMovementChartItemDto>();
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            totals.TryGetValue(date, out var dayTotals);
            result.Add(new StockMovementChartItemDto
            {
                Date = DateOnly.FromDateTime(date),
                InQuantity = dayTotals.InQuantity,
                OutQuantity = dayTotals.OutQuantity
            });
        }

        return result;
    }

    public async Task<StockSummaryDto> GetSummaryAsync(string companyId)
    {
        var totalProducts = await _context.Products.CountAsync(p => p.CompanyId == companyId);
        var totalLocations = await _context.WarehouseLocations.CountAsync(w => w.CompanyId == companyId);

        var stockQuery = _context.Stocks.Where(s => s.CompanyId == companyId);
        var totalStockQuantity = await stockQuery.SumAsync(s => (int?)s.Quantity) ?? 0;
        var lowStockCount = await stockQuery.CountAsync(s => s.Quantity < LowStockThreshold);

        return new StockSummaryDto
        {
            TotalProducts = totalProducts,
            TotalLocations = totalLocations,
            TotalStockQuantity = totalStockQuantity,
            LowStockCount = lowStockCount
        };
    }

    public async Task<OperationResult<StockMovementDto>> ApplyMovementAsync(StockMovementRequestDto dto)
    {
        if (dto.Quantity <= 0)
            return OperationResult<StockMovementDto>.Bad("Quantity must be greater than zero.");

        var stock = await _stockRepository.GetByProductAndLocationAsync(
            dto.ProductId, dto.WarehouseLocationId, dto.CompanyId);

        if (dto.Type == StockMovementType.Out)
        {
            var available = stock?.Quantity ?? 0;
            if (available < dto.Quantity)
                return OperationResult<StockMovementDto>.Bad(
                    $"Insufficient stock. Available: {available}, requested: {dto.Quantity}.");
        }

        var now = DateTime.UtcNow;

        if (stock is null)
        {
            stock = new Stock
            {
                ProductId = dto.ProductId,
                WarehouseLocationId = dto.WarehouseLocationId,
                Quantity = 0,
                CompanyId = dto.CompanyId,
                CreatedAt = now
            };
            await _stockRepository.AddAsync(stock);
        }

        if (dto.Type == StockMovementType.In)
            stock.Quantity += dto.Quantity;
        else
            stock.Quantity -= dto.Quantity;

        if (_context.Entry(stock).State != EntityState.Added)
        {
            stock.UpdatedAt = now;
            _stockRepository.Update(stock);
        }

        var movement = new StockMovement
        {
            ProductId = dto.ProductId,
            WarehouseLocationId = dto.WarehouseLocationId,
            Quantity = dto.Quantity,
            Type = dto.Type,
            TransactionDate = now,
            CompanyId = dto.CompanyId,
            CreatedAt = now
        };

        await _stockMovementRepository.AddAsync(movement);
        await _context.SaveChangesAsync();

        var saved = await _stockMovementRepository.GetByIdAsync(movement.Id);
        return OperationResult<StockMovementDto>.Ok(ToMovementDto(saved ?? movement));
    }

    private static StockDto ToStockDto(Stock s) => new()
    {
        Id = s.Id,
        ProductId = s.ProductId,
        ProductName = s.Product?.Name ?? string.Empty,
        WarehouseLocationId = s.WarehouseLocationId,
        WarehouseLocationName = s.WarehouseLocation?.Name ?? string.Empty,
        Quantity = s.Quantity,
        CompanyId = s.CompanyId,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt
    };

    private static StockMovementDto ToMovementDto(StockMovement sm) => new()
    {
        Id = sm.Id,
        ProductId = sm.ProductId,
        ProductName = sm.Product?.Name ?? string.Empty,
        WarehouseLocationId = sm.WarehouseLocationId,
        WarehouseLocationName = sm.WarehouseLocation?.Name ?? string.Empty,
        Quantity = sm.Quantity,
        Type = sm.Type,
        TransactionDate = sm.TransactionDate,
        CompanyId = sm.CompanyId,
        CreatedAt = sm.CreatedAt
    };
}
