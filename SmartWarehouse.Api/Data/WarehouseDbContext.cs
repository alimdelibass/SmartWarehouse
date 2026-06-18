using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Entities;

namespace SmartWarehouse.Api.Data;

public class WarehouseDbContext : DbContext
{
    public WarehouseDbContext(DbContextOptions<WarehouseDbContext> options) : base(options) { }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<WarehouseLocation> WarehouseLocations => Set<WarehouseLocation>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Company>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Company>()
            .HasIndex(c => c.Code)
            .IsUnique();

        modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WarehouseLocation>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Stock>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<StockMovement>().HasQueryFilter(e => !e.IsDeleted);

        modelBuilder.Entity<Stock>()
            .HasIndex(s => new { s.ProductId, s.WarehouseLocationId, s.CompanyId })
            .IsUnique();
    }
}
