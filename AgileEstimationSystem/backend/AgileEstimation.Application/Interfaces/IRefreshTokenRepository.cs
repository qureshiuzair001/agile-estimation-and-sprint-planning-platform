using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken);

    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);

    void Update(RefreshToken refreshToken);

    Task SaveChangesAsync();
}
