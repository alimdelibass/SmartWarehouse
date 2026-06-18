using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Entities;
using SmartWarehouse.Api.Enums;

namespace SmartWarehouse.Api.Repositories;

public class StockMovementRepository : IRepository<StockMovement>
{
    private readonly WarehouseDbContext _context;

    public StockMovementRepository(WarehouseDbContext context)
    {
        _context = context;
    }

    public IQueryable<StockMovement> Query(string companyId) =>
        _context.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.WarehouseLocation)
            .Where(sm => sm.CompanyId == companyId);

    public async Task<StockMovement?> GetByIdAsync(int id) =>
        await _context.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.WarehouseLocation)
            .FirstOrDefaultAsync(sm => sm.Id == id);

    public async Task<List<StockMovement>> GetAllAsync(string companyId) =>
        await Query(companyId)
            .OrderByDescending(sm => sm.TransactionDate)
            .ToListAsync();

    public async Task AddAsync(StockMovement entity) =>
        await _context.StockMovements.AddAsync(entity);

    public void Update(StockMovement entity) =>
        _context.Entry(entity).State = EntityState.Modified;

    public void SoftDelete(StockMovement entity)
    {
        entity.IsDeleted = true;
        _context.Entry(entity).State = EntityState.Modified;
    }

    public async Task<Dictionary<DateTime, (int InQuantity, int OutQuantity)>> GetDailyTotalsAsync(
        string companyId, DateTime startDate, DateTime endDate)
    {
        var endExclusive = endDate.AddDays(1);

        var rows = await _context.StockMovements
            .Where(sm => sm.CompanyId == companyId
                && sm.TransactionDate >= startDate
                && sm.TransactionDate < endExclusive)
            .GroupBy(sm => sm.TransactionDate.Date)
            .Select(g => new
            {
                Date = g.Key,
                InQuantity = g.Where(x => x.Type == StockMovementType.In).Sum(x => (int?)x.Quantity) ?? 0,
                OutQuantity = g.Where(x => x.Type == StockMovementType.Out).Sum(x => (int?)x.Quantity) ?? 0
            })
            .ToListAsync();

        return rows.ToDictionary(r => r.Date, r => (r.InQuantity, r.OutQuantity));
    }
}
