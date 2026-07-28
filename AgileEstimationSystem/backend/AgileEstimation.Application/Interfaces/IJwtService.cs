using AgileEstimation.Application.DTOs.Auth;
using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface IJwtService
{
    JwtTokenResult GenerateToken(User user);
}