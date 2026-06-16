using VmsBackend.Models.Requests;

namespace VmsBackend.Services.Interfaces;

public interface IForgotPasswordService
{
    Task SendOtpAsync(ForgotPasswordRequest request);
    Task<string> VerifyOtpAsync(VerifyOtpRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
}
