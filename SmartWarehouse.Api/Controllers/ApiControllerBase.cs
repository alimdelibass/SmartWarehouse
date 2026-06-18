using Microsoft.AspNetCore.Mvc;
using SmartWarehouse.Api.Common;

namespace SmartWarehouse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected bool TryValidateCompanyId<T>(string? companyId, out ActionResult<ApiResponseDto<T>> error)
    {
        if (string.IsNullOrWhiteSpace(companyId))
        {
            error = BadRequest(ApiResponseDto<T>.Fail("CompanyId is required."));
            return false;
        }

        error = default!;
        return true;
    }

    protected ActionResult<ApiResponseDto<T>> FromResult<T>(OperationResult<T> result)
    {
        return result.Status switch
        {
            OperationStatus.Success => Ok(ApiResponseDto<T>.Ok(result.Data!, result.Message)),
            OperationStatus.NotFound => NotFound(ApiResponseDto<T>.Fail(result.Message ?? "Not found.")),
            OperationStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden,
                ApiResponseDto<T>.Fail(result.Message ?? "Forbidden.")),
            OperationStatus.BadRequest => BadRequest(ApiResponseDto<T>.Fail(result.Message ?? "Bad request.")),
            _ => StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponseDto<T>.Fail("Unexpected error."))
        };
    }
}
