using SmartWarehouse.Api.Enums;

namespace SmartWarehouse.Api.Entities;

public class StockMovement : BaseEntity
{
    public int ProductId { get; set; }
    public int WarehouseLocationId { get; set; }
    public int Quantity { get; set; }
    public StockMovementType Type { get; set; }
    public DateTime TransactionDate { get; set; }

    public Product Product { get; set; } = null!;
    public WarehouseLocation WarehouseLocation { get; set; } = null!;
}
