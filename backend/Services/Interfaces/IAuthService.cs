using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;

namespace VmsBackend.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task LogoutAsync(string token);
    Task<LoginResponse> RefreshAsync(string token);
}
