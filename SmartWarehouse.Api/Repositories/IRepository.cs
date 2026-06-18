namespace SmartWarehouse.Api.Repositories;

public interface IRepository<T> where T : class
{
    IQueryable<T> Query(string companyId);
    Task<T?> GetByIdAsync(int id);
    Task<List<T>> GetAllAsync(string companyId);
    Task AddAsync(T entity);
    void Update(T entity);
    void SoftDelete(T entity);
}
