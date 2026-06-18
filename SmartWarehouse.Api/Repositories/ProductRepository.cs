using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Entities;

namespace SmartWarehouse.Api.Repositories;

public class ProductRepository : IRepository<Product>
{
    private readonly WarehouseDbContext _context;

    public ProductRepository(WarehouseDbContext context)
    {
        _context = context;
    }

    public IQueryable<Product> Query(string companyId) =>
        _context.Products.Where(p => p.CompanyId == companyId);

    public async Task<Product?> GetByIdAsync(int id) =>
        await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Product>> GetAllAsync(string companyId) =>
        await _context.Products
            .Where(p => p.CompanyId == companyId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(Product entity) =>
        await _context.Products.AddAsync(entity);

    public void Update(Product entity) =>
        _context.Entry(entity).State = EntityState.Modified;

    public void SoftDelete(Product entity)
    {
        entity.IsDeleted = true;
        _context.Entry(entity).State = EntityState.Modified;
    }
}
