using Microsoft.EntityFrameworkCore;
using VmsBackend.Models;

namespace VmsBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordHistory> PasswordHistories => Set<PasswordHistory>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasDefaultValue("receptionist");
        });

        modelBuilder.Entity<PasswordHistory>(e =>
        {
            e.HasKey(ph => ph.Id);
            e.HasOne(ph => ph.User).WithMany().HasForeignKey(ph => ph.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PasswordResetToken>(e =>
        {
            e.HasKey(prt => prt.Id);
            e.HasOne(prt => prt.User).WithMany().HasForeignKey(prt => prt.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(al => al.Id);
            e.Property(al => al.EventType).IsRequired();
        });
    }
}
