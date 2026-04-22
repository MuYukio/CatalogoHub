namespace CatalogoHub.api.Domain.DTOs
{
	public class CatalogResponseDto<T>
	{
		public List<T> Results { get; set; } = new();
		public int CurrentPage { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public int TotalCount { get; set; }
	}
}