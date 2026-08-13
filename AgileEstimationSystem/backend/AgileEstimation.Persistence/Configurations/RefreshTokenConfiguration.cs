using AgileEstimation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgileEstimation.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(x => x.Id);

        // Looked up by hash on every refresh call — indexed for that,
        // and unique since a hash collision would otherwise let one
        // token's row silently shadow another's.
        builder.HasIndex(x => x.TokenHash)
               .IsUnique();

        builder.Property(x => x.TokenHash)
               .HasMaxLength(128)
               .IsRequired();

        builder.Property(x => x.ReplacedByTokenHash)
               .HasMaxLength(128);

        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
