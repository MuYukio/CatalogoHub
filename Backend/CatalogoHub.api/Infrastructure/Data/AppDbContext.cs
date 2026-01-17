using CatalogoHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CatalogoHub.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserFavorite>()
                .Property(f => f.CreatedAt)
                .HasDefaultValueSql("NOW()");
        }

        public DbSet<UserFavorite> UserFavorites { get; set; }
    }
}