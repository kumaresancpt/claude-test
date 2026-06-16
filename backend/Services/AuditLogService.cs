using VmsBackend.Data;
using VmsBackend.Models;
using VmsBackend.Services.Interfaces;

namespace VmsBackend.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string eventType, string username, string ipAddress, string userAgent, string result)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            EventType = eventType,
            Username = username,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Result = result,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}
