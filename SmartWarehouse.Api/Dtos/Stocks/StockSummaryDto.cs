namespace SmartWarehouse.Api.Dtos.Stocks;

public class StockSummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalLocations { get; set; }
    public int TotalStockQuantity { get; set; }
    public int LowStockCount { get; set; }
}
