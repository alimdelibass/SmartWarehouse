namespace SmartWarehouse.Api.Dtos.Stocks;

public class StockDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseLocationId { get; set; }
    public string WarehouseLocationName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string CompanyId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
