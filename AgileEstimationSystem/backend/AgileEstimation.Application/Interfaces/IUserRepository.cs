using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task<User?> GetByUsernameAsync(string username);

    Task AddAsync(User user);

    Task SaveChangesAsync();
}