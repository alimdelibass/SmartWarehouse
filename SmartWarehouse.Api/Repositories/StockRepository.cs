using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Entities;

namespace SmartWarehouse.Api.Repositories;

public class StockRepository : IRepository<Stock>
{
    private readonly WarehouseDbContext _context;

    public StockRepository(WarehouseDbContext context)
    {
        _context = context;
    }

    public IQueryable<Stock> Query(string companyId) =>
        _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.WarehouseLocation)
            .Where(s => s.CompanyId == companyId);

    public async Task<Stock?> GetByIdAsync(int id) =>
        await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.WarehouseLocation)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<List<Stock>> GetAllAsync(string companyId) =>
        await Query(companyId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

    public async Task<Stock?> GetByProductAndLocationAsync(int productId, int warehouseLocationId, string companyId) =>
        await _context.Stocks
            .Include(s => s.Product)
            .Include(s => s.WarehouseLocation)
            .FirstOrDefaultAsync(s => s.ProductId == productId
                                   && s.WarehouseLocationId == warehouseLocationId
                                   && s.CompanyId == companyId);

    public async Task AddAsync(Stock entity) =>
        await _context.Stocks.AddAsync(entity);

    public void Update(Stock entity) =>
        _context.Entry(entity).State = EntityState.Modified;

    public void SoftDelete(Stock entity)
    {
        entity.IsDeleted = true;
        _context.Entry(entity).State = EntityState.Modified;
    }
}
