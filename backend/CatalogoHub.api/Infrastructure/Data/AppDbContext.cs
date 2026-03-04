// Infrastructure/Data/AppDbContext.cs
using CatalogoHub.api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CatalogoHub.api.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserFavorite> UserFavorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da tabela Users
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Age).IsRequired();
                entity.Property(e => e.AllowAdultContent).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt);
                entity.Property(e => e.LastLoginAt);
            });

            // Configuração da tabela UserFavorites
            modelBuilder.Entity<UserFavorite>(entity =>
            {
                entity.ToTable("user_favorites");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Type).IsRequired().HasMaxLength(10);
                entity.Property(e => e.ExternalId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CreatedAt).IsRequired();

                // Relação com User
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Favorites)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}