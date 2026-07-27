using AgileEstimation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgileEstimation.Persistence.Configurations;

public class VoteConfiguration : IEntityTypeConfiguration<Vote>
{
    public void Configure(EntityTypeBuilder<Vote> builder)
    {
        
        builder.ToTable("Votes");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.EstimateValue)
               .IsRequired();

        builder.HasOne(v => v.Ticket)
               .WithMany(t => t.Votes)
               .HasForeignKey(v => v.TicketId)
               .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(v => v.User)
               .WithMany(u => u.Votes)
               .HasForeignKey(v => v.UserId)
               .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(v => new { v.TicketId, v.UserId })
               .IsUnique();
    }
}