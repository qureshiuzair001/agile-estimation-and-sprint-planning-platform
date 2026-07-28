using AgileEstimation.Application.DTOs.Auth;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AgileEstimation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (!result.Success)
            return Unauthorized(result);

        return Ok(result);
    }





[Authorize]
[HttpGet("me")]
public IActionResult Me()
{
    return Ok(new
    {
        Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
        Username = User.FindFirst(ClaimTypes.Name)?.Value,
        Email = User.FindFirst(ClaimTypes.Email)?.Value,
        Role = User.FindFirst(ClaimTypes.Role)?.Value
    });
}
}