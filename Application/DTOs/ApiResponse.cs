namespace Application.DTOs
{
    /// <summary>
    /// Khung response thống nhất cho toàn bộ API: { success, data, message, errors }
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public object? Errors { get; set; }

        public static ApiResponse<T> Ok(T data, string? message = null) =>
            new() { Success = true, Data = data, Message = message };

        public static ApiResponse<T> Fail(string message, object? errors = null) =>
            new() { Success = false, Message = message, Errors = errors };
    }

    /// <summary>
    /// Khung response không có data
    /// </summary>
    public class ApiResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public object? Errors { get; set; }

        public static ApiResponse Ok(string message = "Thành công") =>
            new() { Success = true, Message = message };

        public static ApiResponse Fail(string message, object? errors = null) =>
            new() { Success = false, Message = message, Errors = errors };
    }
}
