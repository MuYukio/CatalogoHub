using System.Text.Json.Serialization;

namespace CatalogoHub.api.Infrastructure.ExternalApis
{
	public class RawgSearchResponse
	{
		[JsonPropertyName("count")]
		public int? Count { get; set; }

		[JsonPropertyName("next")]
		public string? Next { get; set; }

		[JsonPropertyName("results")]
		public List<RawgGame> Results { get; set; } = new();
	}

	public class RawgGame
	{
		[JsonPropertyName("id")]
		public int Id { get; set; }

		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;

		[JsonPropertyName("released")]
		public string? Released { get; set; }

		[JsonPropertyName("background_image")]
		public string? BackgroundImage { get; set; }

		[JsonPropertyName("rating")]
		public double Rating { get; set; }

		[JsonPropertyName("platforms")]
		public List<PlatformInfo> Platforms { get; set; } = new();

		[JsonPropertyName("genres")]
		public List<Genre> Genres { get; set; } = new();

		[JsonPropertyName("esrb_rating")]
		public EsrbRating? EsrbRating { get; set; }

		[JsonPropertyName("description_raw")]
		public string? DescriptionRaw { get; set; }

		[JsonPropertyName("metacritic")]
		public int? Metacritic { get; set; }

		[JsonPropertyName("tags")]
		public List<RawgTag> Tags { get; set; } = new();

		[JsonPropertyName("developers")]
		public List<RawgDeveloper> Developers { get; set; } = new();

		[JsonPropertyName("publishers")]
		public List<RawgPublisher> Publishers { get; set; } = new();

		
	}

	public class EsrbRating
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;
	}

	public class PlatformInfo
	{
		[JsonPropertyName("platform")]
		public Platform Platform { get; set; } = new();
	}

	public class Platform
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;
	}

	public class Genre
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;
	}

	public class RawgTag
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;
	}

	public class RawgDeveloper
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;
	}

	public class RawgPublisher
	{
		[JsonPropertyName("name")]
		public string Name { get; set; } = string.Empty;
	}

	public class GameSearchResponseDto
	{
		public List<CatalogoHub.api.Domain.DTOs.GameDto> Results { get; set; } = new();
		public bool HasNextPage { get; set; }
	}

    public class RawgGenresResponse
    {
        [JsonPropertyName("results")]
        public List<RawgGenreItem> Results { get; set; } = new();
    }

    public class RawgGenreItem
    {
        [JsonPropertyName("id")] public int Id { get; set; }
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("slug")] public string Slug { get; set; } = string.Empty;
    }
}