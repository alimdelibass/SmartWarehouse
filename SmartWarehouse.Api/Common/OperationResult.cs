namespace SmartWarehouse.Api.Common;

public enum OperationStatus
{
    Success,
    NotFound,
    Forbidden,
    BadRequest
}

public class OperationResult<T>
{
    public OperationStatus Status { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }

    public static OperationResult<T> Ok(T data, string? message = null) =>
        new() { Status = OperationStatus.Success, Data = data, Message = message };

    public static OperationResult<T> NotFound(string? message = null) =>
        new() { Status = OperationStatus.NotFound, Message = message };

    public static OperationResult<T> Forbidden(string? message = null) =>
        new() { Status = OperationStatus.Forbidden, Message = message };

    public static OperationResult<T> Bad(string? message = null) =>
        new() { Status = OperationStatus.BadRequest, Message = message };
}
