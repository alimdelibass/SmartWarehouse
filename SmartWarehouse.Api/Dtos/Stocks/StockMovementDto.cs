using SmartWarehouse.Api.Enums;

namespace SmartWarehouse.Api.Dtos.Stocks;

public class StockMovementDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseLocationId { get; set; }
    public string WarehouseLocationName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public StockMovementType Type { get; set; }
    public DateTime TransactionDate { get; set; }
    public string CompanyId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
