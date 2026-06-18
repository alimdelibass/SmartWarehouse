using Microsoft.AspNetCore.Mvc;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Dtos.Stocks;
using SmartWarehouse.Api.Enums;
using SmartWarehouse.Api.Managers;

namespace SmartWarehouse.Api.Controllers;

public class StocksController : ApiControllerBase
{
    private readonly StockManager _stockManager;

    public StocksController(StockManager stockManager)
    {
        _stockManager = stockManager;
    }

    [HttpGet("paged")]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<StockDto>>>> GetStocksPaged(
        [FromQuery] string companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null,
        [FromQuery] int? warehouseLocationId = null)
    {
        if (!TryValidateCompanyId<PagedResultDto<StockDto>>(companyId, out var error))
            return error;

        var result = await _stockManager.GetStocksPagedAsync(companyId, page, pageSize, search, warehouseLocationId);
        return Ok(ApiResponseDto<PagedResultDto<StockDto>>.Ok(result));
    }

    [HttpGet("movements/paged")]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<StockMovementDto>>>> GetMovementsPaged(
        [FromQuery] string companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null,
        [FromQuery] StockMovementType? type = null)
    {
        if (!TryValidateCompanyId<PagedResultDto<StockMovementDto>>(companyId, out var error))
            return error;

        var result = await _stockManager.GetMovementsPagedAsync(companyId, page, pageSize, search, type);
        return Ok(ApiResponseDto<PagedResultDto<StockMovementDto>>.Ok(result));
    }

    [HttpGet("movements/chart")]
    public async Task<ActionResult<ApiResponseDto<List<StockMovementChartItemDto>>>> GetMovementChart(
        [FromQuery] string companyId)
    {
        if (!TryValidateCompanyId<List<StockMovementChartItemDto>>(companyId, out var error))
            return error;

        var result = await _stockManager.GetMovementChartAsync(companyId);
        return Ok(ApiResponseDto<List<StockMovementChartItemDto>>.Ok(result));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponseDto<StockSummaryDto>>> GetSummary([FromQuery] string companyId)
    {
        if (!TryValidateCompanyId<StockSummaryDto>(companyId, out var error))
            return error;

        var result = await _stockManager.GetSummaryAsync(companyId);
        return Ok(ApiResponseDto<StockSummaryDto>.Ok(result));
    }

    [HttpPost("movement")]
    public async Task<ActionResult<ApiResponseDto<StockMovementDto>>> ApplyMovement([FromBody] StockMovementRequestDto dto)
    {
        if (!TryValidateCompanyId<StockMovementDto>(dto.CompanyId, out var error))
            return error;

        var result = await _stockManager.ApplyMovementAsync(dto);
        return FromResult(result);
    }
}
