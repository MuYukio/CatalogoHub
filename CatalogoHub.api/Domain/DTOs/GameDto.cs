namespace CatalogoHub.api.Domain.DTOs
{
    public class GameDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Released { get; set; } = string.Empty;
        public string BackgroundImage { get; set; } = string.Empty;
        public double Rating { get; set; }
        public List<string> Platforms { get; set; } = new();
        public List<string> Genres { get; set; } = new();
        public string? EsrbRating { get; set; } // "Mature", "Adult Only", etc.
        public bool IsAdultContent { get; set; }
        public List<string> ContentWarnings { get; set; } = new();
        
    }
}