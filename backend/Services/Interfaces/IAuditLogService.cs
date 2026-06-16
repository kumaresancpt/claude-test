namespace VmsBackend.Services.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(string eventType, string username, string ipAddress, string userAgent, string result);
}
