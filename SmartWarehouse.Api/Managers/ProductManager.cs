using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Dtos.Products;
using SmartWarehouse.Api.Entities;
using SmartWarehouse.Api.Repositories;

namespace SmartWarehouse.Api.Managers;

public class ProductManager
{
    private readonly ProductRepository _productRepository;
    private readonly WarehouseDbContext _context;

    public ProductManager(ProductRepository productRepository, WarehouseDbContext context)
    {
        _productRepository = productRepository;
        _context = context;
    }

    public async Task<PagedResultDto<ProductDto>> GetPagedAsync(
        string companyId, int page, int pageSize, string? search, string? category)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 25;

        var query = _productRepository.Query(companyId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Sku.Contains(search));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        var totalCount = await query.CountAsync();

        var entities = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ProductDto>
        {
            Items = entities.Select(ToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<ProductDto>> GetByCompanyAsync(string companyId)
    {
        var products = await _productRepository.GetAllAsync(companyId);
        return products.Select(ToDto).ToList();
    }

    public async Task<OperationResult<ProductDto>> GetByIdAsync(int id, string companyId)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product is null)
            return OperationResult<ProductDto>.NotFound("Product not found.");

        if (product.CompanyId != companyId)
            return OperationResult<ProductDto>.Forbidden("Product belongs to another company.");

        return OperationResult<ProductDto>.Ok(ToDto(product));
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Sku = dto.Sku,
            Category = dto.Category,
            CompanyId = dto.CompanyId,
            CreatedAt = DateTime.UtcNow
        };

        await _productRepository.AddAsync(product);
        await _context.SaveChangesAsync();

        return ToDto(product);
    }

    public async Task<OperationResult<ProductDto>> UpdateAsync(UpdateProductDto dto)
    {
        var product = await _productRepository.GetByIdAsync(dto.Id);
        if (product is null)
            return OperationResult<ProductDto>.NotFound("Product not found.");

        if (product.CompanyId != dto.CompanyId)
            return OperationResult<ProductDto>.Forbidden("Product belongs to another company.");

        product.Name = dto.Name;
        product.Sku = dto.Sku;
        product.Category = dto.Category;
        product.UpdatedAt = DateTime.UtcNow;

        _productRepository.Update(product);
        await _context.SaveChangesAsync();

        return OperationResult<ProductDto>.Ok(ToDto(product));
    }

    public async Task<OperationResult<bool>> DeleteAsync(DeleteProductDto dto)
    {
        var product = await _productRepository.GetByIdAsync(dto.Id);
        if (product is null)
            return OperationResult<bool>.NotFound("Product not found.");

        if (product.CompanyId != dto.CompanyId)
            return OperationResult<bool>.Forbidden("Product belongs to another company.");

        product.UpdatedAt = DateTime.UtcNow;
        _productRepository.SoftDelete(product);
        await _context.SaveChangesAsync();

        return OperationResult<bool>.Ok(true);
    }

    private static ProductDto ToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Sku = p.Sku,
        Category = p.Category,
        CompanyId = p.CompanyId,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
