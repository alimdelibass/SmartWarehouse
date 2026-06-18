namespace SmartWarehouse.Api.Dtos.WarehouseLocations;

public class UpdateWarehouseLocationDto
{
    public int Id { get; set; }
    public string CompanyId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
