namespace SmartWarehouse.Api.Dtos.Stocks;

public class StockMovementChartItemDto
{
    public DateOnly Date { get; set; }
    public int InQuantity { get; set; }
    public int OutQuantity { get; set; }
}
