namespace SmartWarehouse.Api.Common;

public class PagedRequestDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
    public string? Search { get; set; }
}
