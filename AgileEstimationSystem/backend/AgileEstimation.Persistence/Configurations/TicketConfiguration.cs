using AgileEstimation.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgileEstimation.Persistence.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        
        builder.ToTable("Tickets");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title)
               .HasMaxLength(200)
               .IsRequired();

        builder.Property(t => t.Description)
               .HasMaxLength(1000);

        builder.Property(t => t.Status)
               .HasConversion<int>()
               .IsRequired();

        builder.Property(t => t.Order)
               .IsRequired();

        builder.Property(t => t.FinalEstimate);

        builder.HasOne(t => t.Session)
               .WithMany(s => s.Tickets)
               .HasForeignKey(t => t.SessionId)
               .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasIndex(t => new { t.SessionId, t.Order });
    }
}