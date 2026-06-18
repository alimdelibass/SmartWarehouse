using Microsoft.AspNetCore.Mvc;
using SmartWarehouse.Api.Common;
using SmartWarehouse.Api.Dtos.Products;
using SmartWarehouse.Api.Managers;

namespace SmartWarehouse.Api.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly ProductManager _productManager;

    public ProductsController(ProductManager productManager)
    {
        _productManager = productManager;
    }

    [HttpGet("paged")]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<ProductDto>>>> GetPaged(
        [FromQuery] string companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null)
    {
        if (!TryValidateCompanyId<PagedResultDto<ProductDto>>(companyId, out var error))
            return error;

        var result = await _productManager.GetPagedAsync(companyId, page, pageSize, search, category);
        return Ok(ApiResponseDto<PagedResultDto<ProductDto>>.Ok(result));
    }

    [HttpGet("by-company/{companyId}")]
    public async Task<ActionResult<ApiResponseDto<List<ProductDto>>>> GetByCompany(string companyId)
    {
        if (!TryValidateCompanyId<List<ProductDto>>(companyId, out var error))
            return error;

        var result = await _productManager.GetByCompanyAsync(companyId);
        return Ok(ApiResponseDto<List<ProductDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponseDto<ProductDto>>> GetById(int id, [FromQuery] string companyId)
    {
        if (!TryValidateCompanyId<ProductDto>(companyId, out var error))
            return error;

        var result = await _productManager.GetByIdAsync(id, companyId);
        return FromResult(result);
    }

    [HttpPost("create")]
    public async Task<ActionResult<ApiResponseDto<ProductDto>>> Create([FromBody] CreateProductDto dto)
    {
        if (!TryValidateCompanyId<ProductDto>(dto.CompanyId, out var error))
            return error;

        var result = await _productManager.CreateAsync(dto);
        return Ok(ApiResponseDto<ProductDto>.Ok(result, "Product created."));
    }

    [HttpPost("update")]
    public async Task<ActionResult<ApiResponseDto<ProductDto>>> Update([FromBody] UpdateProductDto dto)
    {
        if (!TryValidateCompanyId<ProductDto>(dto.CompanyId, out var error))
            return error;

        var result = await _productManager.UpdateAsync(dto);
        return FromResult(result);
    }

    [HttpPost("delete")]
    public async Task<ActionResult<ApiResponseDto<bool>>> Delete([FromBody] DeleteProductDto dto)
    {
        if (!TryValidateCompanyId<bool>(dto.CompanyId, out var error))
            return error;

        var result = await _productManager.DeleteAsync(dto);
        return FromResult(result);
    }
}
