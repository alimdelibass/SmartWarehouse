namespace SmartWarehouse.Api.Entities;

public class WarehouseLocation : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}
