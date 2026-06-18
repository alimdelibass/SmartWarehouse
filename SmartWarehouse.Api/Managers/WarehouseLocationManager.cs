using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Dtos.WarehouseLocations;
using SmartWarehouse.Api.Entities;
using SmartWarehouse.Api.Repositories;

namespace SmartWarehouse.Api.Managers;

public class WarehouseLocationManager
{
    private readonly WarehouseLocationRepository _warehouseLocationRepository;
    private readonly WarehouseDbContext _context;

    public WarehouseLocationManager(WarehouseLocationRepository warehouseLocationRepository, WarehouseDbContext context)
    {
        _warehouseLocationRepository = warehouseLocationRepository;
        _context = context;
    }

    public async Task<PagedResultDto<WarehouseLocationDto>> GetPagedAsync(
        string companyId, int page, int pageSize, string? search)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 25;

        var query = _warehouseLocationRepository.Query(companyId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(w => w.Name.Contains(search) || w.Address.Contains(search));

        var totalCount = await query.CountAsync();

        var entities = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<WarehouseLocationDto>
        {
            Items = entities.Select(ToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<WarehouseLocationDto>> GetByCompanyAsync(string companyId)
    {
        var locations = await _warehouseLocationRepository.GetAllAsync(companyId);
        return locations.Select(ToDto).ToList();
    }

    public async Task<OperationResult<WarehouseLocationDto>> GetByIdAsync(int id, string companyId)
    {
        var location = await _warehouseLocationRepository.GetByIdAsync(id);
        if (location is null)
            return OperationResult<WarehouseLocationDto>.NotFound("Warehouse location not found.");

        if (location.CompanyId != companyId)
            return OperationResult<WarehouseLocationDto>.Forbidden("Warehouse location belongs to another company.");

        return OperationResult<WarehouseLocationDto>.Ok(ToDto(location));
    }

    public async Task<WarehouseLocationDto> CreateAsync(CreateWarehouseLocationDto dto)
    {
        var location = new WarehouseLocation
        {
            Name = dto.Name,
            Address = dto.Address,
            CompanyId = dto.CompanyId,
            CreatedAt = DateTime.UtcNow
        };

        await _warehouseLocationRepository.AddAsync(location);
        await _context.SaveChangesAsync();

        return ToDto(location);
    }

    public async Task<OperationResult<WarehouseLocationDto>> UpdateAsync(UpdateWarehouseLocationDto dto)
    {
        var location = await _warehouseLocationRepository.GetByIdAsync(dto.Id);
        if (location is null)
            return OperationResult<WarehouseLocationDto>.NotFound("Warehouse location not found.");

        if (location.CompanyId != dto.CompanyId)
            return OperationResult<WarehouseLocationDto>.Forbidden("Warehouse location belongs to another company.");

        location.Name = dto.Name;
        location.Address = dto.Address;
        location.UpdatedAt = DateTime.UtcNow;

        _warehouseLocationRepository.Update(location);
        await _context.SaveChangesAsync();

        return OperationResult<WarehouseLocationDto>.Ok(ToDto(location));
    }

    public async Task<OperationResult<bool>> DeleteAsync(DeleteWarehouseLocationDto dto)
    {
        var location = await _warehouseLocationRepository.GetByIdAsync(dto.Id);
        if (location is null)
            return OperationResult<bool>.NotFound("Warehouse location not found.");

        if (location.CompanyId != dto.CompanyId)
            return OperationResult<bool>.Forbidden("Warehouse location belongs to another company.");

        location.UpdatedAt = DateTime.UtcNow;
        _warehouseLocationRepository.SoftDelete(location);
        await _context.SaveChangesAsync();

        return OperationResult<bool>.Ok(true);
    }

    private static WarehouseLocationDto ToDto(WarehouseLocation w) => new()
    {
        Id = w.Id,
        Name = w.Name,
        Address = w.Address,
        CompanyId = w.CompanyId,
        CreatedAt = w.CreatedAt,
        UpdatedAt = w.UpdatedAt
    };
}
