namespace SmartWarehouse.Api.Dtos.WarehouseLocations;

public class CreateWarehouseLocationDto
{
    public string CompanyId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
