using CatalogoHub.api.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace CatalogoHub.api.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuração do relacionamento User ↔ Favorites
            modelBuilder.Entity<UserFavorite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade); 
          
        }

        public DbSet<UserFavorite> UserFavorites { get; set; }
    }
}