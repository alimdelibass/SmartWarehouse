using Microsoft.EntityFrameworkCore;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Dtos.Companies;
using SmartWarehouse.Api.Entities;
using SmartWarehouse.Api.Repositories;

namespace SmartWarehouse.Api.Managers;

public class CompanyManager
{
    private readonly CompanyRepository _companyRepository;
    private readonly WarehouseDbContext _context;

    public CompanyManager(CompanyRepository companyRepository, WarehouseDbContext context)
    {
        _companyRepository = companyRepository;
        _context = context;
    }

    public async Task<List<CompanyListItemDto>> GetAllAsync()
    {
        var companies = await _companyRepository.GetAllAsync();
        return companies.Select(ToListItemDto).ToList();
    }

    public async Task<PagedResultDto<CompanyListItemDto>> GetPagedAsync(
        int page, int pageSize, string? search)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 25;

        var query = _companyRepository.Query();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.Code.Contains(search) || c.Name.Contains(search));

        var totalCount = await query.CountAsync();

        var entities = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<CompanyListItemDto>
        {
            Items = entities.Select(ToListItemDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OperationResult<CompanyListItemDto>> CreateAsync(CreateCompanyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
            return OperationResult<CompanyListItemDto>.Bad("Code is required.");

        if (string.IsNullOrWhiteSpace(dto.Name))
            return OperationResult<CompanyListItemDto>.Bad("Name is required.");

        var code = dto.Code.Trim();
        var existing = await _companyRepository.GetByCodeAsync(code);
        if (existing is not null)
            return OperationResult<CompanyListItemDto>.Bad("Company code already exists.");

        var company = new Company
        {
            Code = code,
            Name = dto.Name.Trim(),
            CompanyId = code,
            CreatedAt = DateTime.UtcNow
        };

        await _companyRepository.AddAsync(company);
        await _context.SaveChangesAsync();

        return OperationResult<CompanyListItemDto>.Ok(ToListItemDto(company), "Company created.");
    }

    public async Task<OperationResult<CompanyListItemDto>> UpdateAsync(UpdateCompanyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return OperationResult<CompanyListItemDto>.Bad("Name is required.");

        var company = await _companyRepository.GetByIdAsync(dto.Id);
        if (company is null)
            return OperationResult<CompanyListItemDto>.NotFound("Company not found.");

        company.Name = dto.Name.Trim();
        company.UpdatedAt = DateTime.UtcNow;

        _companyRepository.Update(company);
        await _context.SaveChangesAsync();

        return OperationResult<CompanyListItemDto>.Ok(ToListItemDto(company), "Company updated.");
    }

    public async Task<OperationResult<bool>> DeleteAsync(DeleteCompanyDto dto)
    {
        var company = await _companyRepository.GetByIdAsync(dto.Id);
        if (company is null)
            return OperationResult<bool>.NotFound("Company not found.");

        company.UpdatedAt = DateTime.UtcNow;
        _companyRepository.SoftDelete(company);
        await _context.SaveChangesAsync();

        return OperationResult<bool>.Ok(true, "Company deleted.");
    }

    private static CompanyListItemDto ToListItemDto(Company c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        Name = c.Name,
        CreatedAt = c.CreatedAt
    };
}
