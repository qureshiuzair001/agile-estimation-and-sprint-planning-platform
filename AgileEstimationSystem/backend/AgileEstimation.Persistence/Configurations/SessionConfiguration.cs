using AgileEstimation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgileEstimation.Persistence.Configurations;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("Sessions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SessionCode)
               .HasMaxLength(10)
               .IsRequired();

        builder.Property(x => x.Title)
               .HasMaxLength(200)
               .IsRequired();

        builder.Property(x => x.Status)
               .HasConversion<int>();

        builder.HasOne(x => x.Moderator)
               .WithMany(x => x.CreatedSessions)
               .HasForeignKey(x => x.ModeratorId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}