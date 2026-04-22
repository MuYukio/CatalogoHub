using System.Text.Json.Serialization;
using CatalogoHub.api.Infrastructure.ExternalApis;
namespace CatalogoHub.api.Infrastructure.ExternalApis;


public class JikanImages
{
    [JsonPropertyName("jpg")]
    public JikanImageJpg? JPG { get; set; }

    [JsonPropertyName("webp")]
    public JikanImageWebp? WebP { get; set; }
}

public class JikanImageJpg
{
    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("large_image_url")]
    public string? LargeImageUrl { get; set; }
}

public class JikanImageWebp
{
    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("large_image_url")]
    public string? LargeImageUrl { get; set; }
}


public class JikanGenre
{
    [JsonPropertyName("mal_id")]
    public int MalId { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }
}


public class JikanAnimeData
{
    [JsonPropertyName("mal_id")]
    public int MalId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("title_english")]
    public string? TitleEnglish { get; set; }

    [JsonPropertyName("title_japanese")]
    public string? TitleJapanese { get; set; }

    [JsonPropertyName("synopsis")]
    public string? Synopsis { get; set; }

    [JsonPropertyName("images")]
    public JikanImages? Images { get; set; }

    [JsonPropertyName("score")]
    public decimal? Score { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("episodes")]
    public int? Episodes { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("rating")]
    public string? Rating { get; set; }

    [JsonPropertyName("genres")]
    public List<JikanGenre> Genres { get; set; } = new();

    [JsonPropertyName("rank")]
    public int? Rank { get; set; }

    [JsonPropertyName("popularity")]
    public int? Popularity { get; set; }

    [JsonPropertyName("source")]
    public string? Source { get; set; }

    [JsonPropertyName("aired")]
    public JikanAired? Aired { get; set; }
}


public class JikanPagination
{
    [JsonPropertyName("has_next_page")]
    public bool HasNextPage { get; set; }

    [JsonPropertyName("last_visible_page")]
    public int LastVisiblePage { get; set; }
}


public class JikanApiResponse
{
    [JsonPropertyName("data")]
    public List<JikanAnimeData>? Data { get; set; }

    [JsonPropertyName("pagination")]
    public JikanPagination? Pagination { get; set; }
}

public class JikanTopResponse
{
    [JsonPropertyName("data")]
    public List<JikanAnimeData>? Data { get; set; }

    [JsonPropertyName("pagination")]
    public JikanPagination? Pagination { get; set; }
}

public class JikanAnimeResponse
{
    [JsonPropertyName("data")]
    public JikanAnimeData? Data { get; set; }
}
public class JikanAired
{
    [JsonPropertyName("string")]
    public string? String { get; set; }
}

public class JikanGenresResponse
{
    [JsonPropertyName("data")]
    public List<JikanGenreItem> Data { get; set; } = new();
}

public class JikanGenreItem
{
    [JsonPropertyName("mal_id")] public int MalId { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
}