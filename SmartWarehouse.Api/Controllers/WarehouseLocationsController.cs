using Microsoft.AspNetCore.Mvc;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Dtos.WarehouseLocations;
using SmartWarehouse.Api.Managers;

namespace SmartWarehouse.Api.Controllers;

public class WarehouseLocationsController : ApiControllerBase
{
    private readonly WarehouseLocationManager _warehouseLocationManager;

    public WarehouseLocationsController(WarehouseLocationManager warehouseLocationManager)
    {
        _warehouseLocationManager = warehouseLocationManager;
    }

    [HttpGet("paged")]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<WarehouseLocationDto>>>> GetPaged(
        [FromQuery] string companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null)
    {
        if (!TryValidateCompanyId<PagedResultDto<WarehouseLocationDto>>(companyId, out var error))
            return error;

        var result = await _warehouseLocationManager.GetPagedAsync(companyId, page, pageSize, search);
        return Ok(ApiResponseDto<PagedResultDto<WarehouseLocationDto>>.Ok(result));
    }

    [HttpGet("by-company/{companyId}")]
    public async Task<ActionResult<ApiResponseDto<List<WarehouseLocationDto>>>> GetByCompany(string companyId)
    {
        if (!TryValidateCompanyId<List<WarehouseLocationDto>>(companyId, out var error))
            return error;

        var result = await _warehouseLocationManager.GetByCompanyAsync(companyId);
        return Ok(ApiResponseDto<List<WarehouseLocationDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponseDto<WarehouseLocationDto>>> GetById(int id, [FromQuery] string companyId)
    {
        if (!TryValidateCompanyId<WarehouseLocationDto>(companyId, out var error))
            return error;

        var result = await _warehouseLocationManager.GetByIdAsync(id, companyId);
        return FromResult(result);
    }

    [HttpPost("create")]
    public async Task<ActionResult<ApiResponseDto<WarehouseLocationDto>>> Create([FromBody] CreateWarehouseLocationDto dto)
    {
        if (!TryValidateCompanyId<WarehouseLocationDto>(dto.CompanyId, out var error))
            return error;

        var result = await _warehouseLocationManager.CreateAsync(dto);
        return Ok(ApiResponseDto<WarehouseLocationDto>.Ok(result, "Warehouse location created."));
    }

    [HttpPost("update")]
    public async Task<ActionResult<ApiResponseDto<WarehouseLocationDto>>> Update([FromBody] UpdateWarehouseLocationDto dto)
    {
        if (!TryValidateCompanyId<WarehouseLocationDto>(dto.CompanyId, out var error))
            return error;

        var result = await _warehouseLocationManager.UpdateAsync(dto);
        return FromResult(result);
    }

    [HttpPost("delete")]
    public async Task<ActionResult<ApiResponseDto<bool>>> Delete([FromBody] DeleteWarehouseLocationDto dto)
    {
        if (!TryValidateCompanyId<bool>(dto.CompanyId, out var error))
            return error;

        var result = await _warehouseLocationManager.DeleteAsync(dto);
        return FromResult(result);
    }
}
