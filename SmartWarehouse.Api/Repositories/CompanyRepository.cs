using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Entities;

namespace SmartWarehouse.Api.Repositories;

public class CompanyRepository
{
    private readonly WarehouseDbContext _context;

    public CompanyRepository(WarehouseDbContext context)
    {
        _context = context;
    }

    public IQueryable<Company> Query() => _context.Companies;

    public async Task<Company?> GetByIdAsync(int id) =>
        await _context.Companies.FirstOrDefaultAsync(c => c.Id == id);

    public async Task<Company?> GetByCodeAsync(string code) =>
        await _context.Companies.FirstOrDefaultAsync(c => c.Code == code);

    public async Task<List<Company>> GetAllAsync() =>
        await _context.Companies
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(Company entity) =>
        await _context.Companies.AddAsync(entity);

    public void Update(Company entity) =>
        _context.Entry(entity).State = EntityState.Modified;

    public void SoftDelete(Company entity)
    {
        entity.IsDeleted = true;
        _context.Entry(entity).State = EntityState.Modified;
    }
}
