using Microsoft.AspNetCore.Mvc;
using VmsBackend.Models.Requests;
using VmsBackend.Services.Interfaces;

namespace VmsBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var ua = Request.Headers["User-Agent"].ToString();
            var result = await _auth.LoginAsync(request, ip, ua);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("LOCKOUT:"))
        {
            var seconds = int.Parse(ex.Message.Split(':')[1]);
            return StatusCode(423, new { detail = $"Account locked due to too many failed attempts. Try again in {seconds / 60 + 1} minutes.", remaining_seconds = seconds });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { detail = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromHeader(Name = "Authorization")] string? authHeader)
    {
        var token = authHeader?.Replace("Bearer ", "") ?? string.Empty;
        await _auth.LogoutAsync(token);
        return Ok(new { detail = "Logged out successfully." });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromHeader(Name = "Authorization")] string? authHeader)
    {
        try
        {
            var token = authHeader?.Replace("Bearer ", "") ?? string.Empty;
            var result = await _auth.RefreshAsync(token);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { detail = ex.Message });
        }
    }
}
