using Microsoft.AspNetCore.Mvc;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Dtos.Companies;
using SmartWarehouse.Api.Managers;

namespace SmartWarehouse.Api.Controllers;

public class CompaniesController : ApiControllerBase
{
    private readonly CompanyManager _companyManager;

    public CompaniesController(CompanyManager companyManager)
    {
        _companyManager = companyManager;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<List<CompanyListItemDto>>>> GetAll()
    {
        var result = await _companyManager.GetAllAsync();
        return Ok(ApiResponseDto<List<CompanyListItemDto>>.Ok(result));
    }

    [HttpGet("paged")]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<CompanyListItemDto>>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null)
    {
        var result = await _companyManager.GetPagedAsync(page, pageSize, search);
        return Ok(ApiResponseDto<PagedResultDto<CompanyListItemDto>>.Ok(result));
    }

    [HttpPost("create")]
    public async Task<ActionResult<ApiResponseDto<CompanyListItemDto>>> Create([FromBody] CreateCompanyDto dto)
    {
        var result = await _companyManager.CreateAsync(dto);
        return FromResult(result);
    }

    [HttpPost("update")]
    public async Task<ActionResult<ApiResponseDto<CompanyListItemDto>>> Update([FromBody] UpdateCompanyDto dto)
    {
        var result = await _companyManager.UpdateAsync(dto);
        return FromResult(result);
    }

    [HttpPost("delete")]
    public async Task<ActionResult<ApiResponseDto<bool>>> Delete([FromBody] DeleteCompanyDto dto)
    {
        var result = await _companyManager.DeleteAsync(dto);
        return FromResult(result);
    }
}
