using AutoMapper;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Infrastructure.ExternalApis;

/*
 * O QUE É: Ferramenta que converte automaticamente um tipo de objeto em outro.

COMO FUNCIONA: Configura regras de mapeamento uma vez (MappingProfile.cs) e usa _mapper.Map<T>(objeto) para conversões automáticas em todo o projeto.

EXEMPLO NO CATALOGOHUB: Converte dados da API Jikan (JikanAnimeData) para seu modelo interno (AnimeDto), tratando inconsistências como Episodes: null → 0.

VANTAGEM: Elimina código repetitivo de conversão manual, centralizando regras e facilitando manutenção.
 
 */


public class MappingProfile : Profile
{

    public class AnimeImageUrlResolver : IValueResolver<JikanAnimeData, AnimeDto, string>
    {
        public string Resolve(JikanAnimeData source, AnimeDto destination,
            string destMember, ResolutionContext context) =>
            source.Images?.JPG?.LargeImageUrl
            ?? source.Images?.WebP?.LargeImageUrl
            ?? source.Images?.JPG?.ImageUrl
            ?? source.Images?.WebP?.ImageUrl
            ?? string.Empty;
    }

    public class GamePlatformsResolver : IValueResolver<RawgGame, GameDto, List<string>>
    {
        public List<string> Resolve(RawgGame source, GameDto destination,
            List<string> destMember, ResolutionContext context) =>
            source.Platforms
                ?.Where(p => p?.Platform != null)
                .Select(p => p.Platform.Name)
                .ToList() ?? new List<string>();
    }

    public MappingProfile()
    {
      
        CreateMap<User, UserDto>(); 

      
        CreateMap<CreateFavoriteDto, UserFavorite>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.User, opt => opt.Ignore());


        CreateMap<UserFavorite, FavoriteDto>();
      
        CreateMap<UserFavorite, FavoritePdfItemDto>()
            .ForMember(dest => dest.AddedDate, opt => opt.MapFrom(src => src.CreatedAt));
     
        CreateMap<JikanAnimeData, AnimeDto>()
            .ForMember(dest => dest.TitleEnglish, opt => opt.MapFrom(src => src.TitleEnglish ?? src.Title))
            .ForMember(dest => dest.TitleJapanese, opt => opt.MapFrom(src => src.TitleJapanese ?? src.Title))
            .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom<AnimeImageUrlResolver>())
            .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score ?? 0))
            .ForMember(dest => dest.Episodes, opt => opt.MapFrom(src => src.Episodes ?? 0))
            .ForMember(dest => dest.Genres, opt => opt.MapFrom(src =>
                src.Genres.Select(g => g.Name).ToList()))
            .ForMember(dest => dest.Rank, opt => opt.MapFrom(src => src.Rank))
            .ForMember(dest => dest.Popularity, opt => opt.MapFrom(src => src.Popularity))
            .ForMember(dest => dest.Source, opt => opt.MapFrom(src => src.Source))
            .ForMember(dest => dest.Aired, opt => opt.MapFrom(src => src.Aired != null ? src.Aired.String : null));

        CreateMap<RawgGame, GameDto>()
            .ForMember(dest => dest.Platforms, opt => opt.MapFrom<GamePlatformsResolver>())
            .ForMember(dest => dest.Genres, opt => opt.MapFrom(src =>
                src.Genres.Select(g => g.Name).ToList()))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.DescriptionRaw))
            .ForMember(dest => dest.Metacritic, opt => opt.MapFrom(src => src.Metacritic))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                src.Tags.Select(t => t.Name).Take(10).ToList()))
            .ForMember(dest => dest.Developer, opt => opt.MapFrom(src =>
                src.Developers.Count > 0 ? src.Developers[0].Name : null))
            .ForMember(dest => dest.Publisher, opt => opt.MapFrom(src =>
                src.Publishers.Count > 0 ? src.Publishers[0].Name : null));
    }
}