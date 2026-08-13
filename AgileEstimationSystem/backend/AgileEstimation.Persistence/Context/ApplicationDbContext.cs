using AgileEstimation.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgileEstimation.Persistence.Context;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Session> Sessions => Set<Session>();

    public DbSet<SessionParticipant> SessionParticipants => Set<SessionParticipant>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<Vote> Votes => Set<Vote>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}