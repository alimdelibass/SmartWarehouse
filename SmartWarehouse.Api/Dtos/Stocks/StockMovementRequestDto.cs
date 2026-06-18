using SmartWarehouse.Api.Enums;

namespace SmartWarehouse.Api.Dtos.Stocks;

public class StockMovementRequestDto
{
    public string CompanyId { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int WarehouseLocationId { get; set; }
    public int Quantity { get; set; }
    public StockMovementType Type { get; set; }
}
