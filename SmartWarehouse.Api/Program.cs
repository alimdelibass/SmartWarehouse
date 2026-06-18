using System.Text.Json.Serialization;
using SmartWarehouse.Api.Data;
using SmartWarehouse.Api.Managers;
using SmartWarehouse.Api.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "FrontendCors";

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = null;
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddDbContext<WarehouseDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<CompanyRepository>();
builder.Services.AddScoped<ProductRepository>();
builder.Services.AddScoped<WarehouseLocationRepository>();
builder.Services.AddScoped<StockRepository>();
builder.Services.AddScoped<StockMovementRepository>();

builder.Services.AddScoped<CompanyManager>();
builder.Services.AddScoped<ProductManager>();
builder.Services.AddScoped<WarehouseLocationManager>();
builder.Services.AddScoped<StockManager>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicy);
app.UseAuthorization();
app.MapControllers();

app.Run();
