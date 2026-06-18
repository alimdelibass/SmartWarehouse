namespace SmartWarehouse.Api.Entities;

public class Stock : BaseEntity
{
    public int ProductId { get; set; }
    public int WarehouseLocationId { get; set; }
    public int Quantity { get; set; }

    public Product Product { get; set; } = null!;
    public WarehouseLocation WarehouseLocation { get; set; } = null!;
}
