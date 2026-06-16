using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using VmsBackend.Data;
using VmsBackend.Models;
using VmsBackend.Models.Requests;
using VmsBackend.Services.Interfaces;

namespace VmsBackend.Services;

public class ForgotPasswordService : IForgotPasswordService
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;
    private const int OtpExpiryMinutes = 10;
    private const int MaxOtpAttempts = 3;

    public ForgotPasswordService(AppDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task SendOtpAsync(ForgotPasswordRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return; // Silent fail — don't reveal whether email exists

        var existing = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .FirstOrDefaultAsync();
        if (existing != null) { existing.IsUsed = true; }

        var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var otpHash = BCrypt.Net.BCrypt.HashPassword(otp);

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            OtpHash = otpHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
        });
        await _db.SaveChangesAsync();

        await _audit.LogAsync("forgot_password", request.Email, string.Empty, string.Empty, "otp_sent");
        // TODO: send OTP via SMTP (SmtpSettings configured in appsettings)
    }

    public async Task<string> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) throw new UnauthorizedAccessException("Invalid request.");

        var token = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

        if (token == null) throw new InvalidOperationException("OTP expired or not found. Please request a new one.");
        if (token.Attempts >= MaxOtpAttempts) throw new InvalidOperationException("Too many OTP attempts. Please request a new one.");

        if (!BCrypt.Net.BCrypt.Verify(request.Otp, token.OtpHash))
        {
            token.Attempts++;
            await _db.SaveChangesAsync();
            throw new UnauthorizedAccessException("Invalid OTP.");
        }

        return $"verified:{token.Id}";
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new ArgumentException("Passwords do not match.");

        if (!IsPasswordComplex(request.NewPassword))
            throw new ArgumentException("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) throw new UnauthorizedAccessException("Invalid request.");

        var token = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();
        if (token == null) throw new InvalidOperationException("Reset session expired. Please request a new OTP.");

        if (!BCrypt.Net.BCrypt.Verify(request.Otp, token.OtpHash))
            throw new UnauthorizedAccessException("Invalid OTP.");

        var lastFive = await _db.PasswordHistories
            .Where(ph => ph.UserId == user.Id)
            .OrderByDescending(ph => ph.CreatedAt)
            .Take(5)
            .ToListAsync();

        if (lastFive.Any(ph => BCrypt.Net.BCrypt.Verify(request.NewPassword, ph.PasswordHash)))
            throw new InvalidOperationException("Cannot reuse one of your last 5 passwords.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _db.PasswordHistories.Add(new PasswordHistory { UserId = user.Id, PasswordHash = user.PasswordHash });
        user.PasswordHash = newHash;
        user.UpdatedAt = DateTime.UtcNow;
        token.IsUsed = true;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("password_reset", request.Email, string.Empty, string.Empty, "success");
    }

    private static bool IsPasswordComplex(string password)
    {
        return password.Length >= 8
            && password.Any(char.IsUpper)
            && password.Any(char.IsLower)
            && password.Any(char.IsDigit)
            && password.Any(c => !char.IsLetterOrDigit(c));
    }
}
