using AgileEstimation.Application.DTOs.Auth;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;

namespace AgileEstimation.Infrastructure.Authentication;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email);

        if (existingEmail != null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Email already exists."
            };
        }

        var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);

        if (existingUsername != null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Username already exists."
            };
        }

        Enum.TryParse<UserRole>(request.Role, true, out var role);

        var user = new User(
            request.Username,
            request.Email,
            _passwordHasher.HashPassword(request.Password),
            role);

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return new AuthResponse
        {
            Success = true,
            Message = "User registered successfully."
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Invalid email or password."
            };
        }

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Invalid email or password."
            };
        }

        var jwtToken = _jwtService.GenerateToken(user);

        return new AuthResponse
        {
            Success = true,
            Message = "Login successful.",
            JwtToken = jwtToken
        };
    }
}