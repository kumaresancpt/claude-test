using Microsoft.AspNetCore.Mvc;
using VmsBackend.Models.Requests;
using VmsBackend.Services.Interfaces;

namespace VmsBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class ForgotPasswordController : ControllerBase
{
    private readonly IForgotPasswordService _forgotPassword;

    public ForgotPasswordController(IForgotPasswordService forgotPassword)
    {
        _forgotPassword = forgotPassword;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _forgotPassword.SendOtpAsync(request);
        return Ok(new { detail = "If the email is registered, an OTP has been sent." });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        try
        {
            var resetToken = await _forgotPassword.VerifyOtpAsync(request);
            return Ok(new { detail = "OTP verified.", resetToken });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { detail = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _forgotPassword.ResetPasswordAsync(request);
            return Ok(new { detail = "Password reset successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { detail = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }
}
