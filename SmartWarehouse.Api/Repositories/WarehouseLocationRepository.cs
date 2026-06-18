using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Entities;

namespace SmartWarehouse.Api.Repositories;

public class WarehouseLocationRepository : IRepository<WarehouseLocation>
{
    private readonly WarehouseDbContext _context;

    public WarehouseLocationRepository(WarehouseDbContext context)
    {
        _context = context;
    }

    public IQueryable<WarehouseLocation> Query(string companyId) =>
        _context.WarehouseLocations.Where(w => w.CompanyId == companyId);

    public async Task<WarehouseLocation?> GetByIdAsync(int id) =>
        await _context.WarehouseLocations.FirstOrDefaultAsync(w => w.Id == id);

    public async Task<List<WarehouseLocation>> GetAllAsync(string companyId) =>
        await _context.WarehouseLocations
            .Where(w => w.CompanyId == companyId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(WarehouseLocation entity) =>
        await _context.WarehouseLocations.AddAsync(entity);

    public void Update(WarehouseLocation entity) =>
        _context.Entry(entity).State = EntityState.Modified;

    public void SoftDelete(WarehouseLocation entity)
    {
        entity.IsDeleted = true;
        _context.Entry(entity).State = EntityState.Modified;
    }
}
