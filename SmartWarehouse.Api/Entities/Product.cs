namespace SmartWarehouse.Api.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    public ICollection<Stock> Stocks { get; set; } = new List<Stock>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}
