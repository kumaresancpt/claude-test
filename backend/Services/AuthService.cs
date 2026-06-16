using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VmsBackend.Data;
using VmsBackend.Models;
using VmsBackend.Models.Requests;
using VmsBackend.Models.Responses;
using VmsBackend.Services.Interfaces;

namespace VmsBackend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IAuditLogService _audit;
    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    public AuthService(AppDbContext db, IConfiguration config, IAuditLogService audit)
    {
        _db = db;
        _config = config;
        _audit = audit;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("Username and password are required.");

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == request.Username || u.Email == request.Username);

        if (user == null)
        {
            await _audit.LogAsync("login_failure", request.Username, ipAddress, userAgent, "user_not_found");
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        if (user.LockoutUntil.HasValue && user.LockoutUntil > DateTime.UtcNow)
        {
            var remaining = (int)(user.LockoutUntil.Value - DateTime.UtcNow).TotalSeconds;
            await _audit.LogAsync("lockout", request.Username, ipAddress, userAgent, "account_locked");
            throw new InvalidOperationException($"LOCKOUT:{remaining}");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            user.FailedAttempts++;
            if (user.FailedAttempts >= MaxFailedAttempts)
            {
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                await _audit.LogAsync("lockout", request.Username, ipAddress, userAgent, "locked_after_5_failures");
            }
            else
            {
                await _audit.LogAsync("login_failure", request.Username, ipAddress, userAgent, $"invalid_password_attempt_{user.FailedAttempts}");
            }
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            if (user.LockoutUntil.HasValue)
            {
                var remaining = (int)(user.LockoutUntil.Value - DateTime.UtcNow).TotalSeconds;
                throw new InvalidOperationException($"LOCKOUT:{remaining}");
            }
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        user.FailedAttempts = 0;
        user.LockoutUntil = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);
        var expiry = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiryMinutes"] ?? "30"));

        await _audit.LogAsync("login_success", request.Username, ipAddress, userAgent, "success");

        return new LoginResponse { Token = token, Role = user.Role, ExpiresAt = expiry };
    }

    public async Task LogoutAsync(string token)
    {
        await Task.CompletedTask;
    }

    public async Task<LoginResponse> RefreshAsync(string token)
    {
        var principal = ValidateToken(token);
        var username = principal?.FindFirst(ClaimTypes.Name)?.Value;
        if (username == null) throw new UnauthorizedAccessException("Invalid token.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) throw new UnauthorizedAccessException("User not found.");

        var newToken = GenerateJwt(user);
        var expiry = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiryMinutes"] ?? "30"));
        return new LoginResponse { Token = newToken, Role = user.Role, ExpiresAt = expiry };
    }

    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "30");

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("sub", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _config["Jwt:Audience"],
                ValidateLifetime = true
            }, out _);
        }
        catch
        {
            return null;
        }
    }
}
