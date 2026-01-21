using AutoMapper;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Domain.DTOs;
using CatalogoHub.api.Infrastructure.ExternalApis;

/*
 * O QUE É: Ferramenta que converte automaticamente um tipo de objeto em outro.

COMO FUNCIONA: Configura regras de mapeamento uma vez (MappingProfile.cs) e usa _mapper.Map<T>(objeto) para conversões automáticas em todo o projeto.

EXEMPLO NO CATALOGOHUB: Converte dados da API Jikan (JikanAnimeData) para seu modelo interno (AnimeDto), tratando inconsistências como Episodes: null → 0.

VANTAGEM: Elimina código repetitivo de conversão manual, centralizando regras e facilitando manutenção.
 
 */


namespace CatalogoHub.api.Infrastructure.Mappings

{
    public class MappingProfile : Profile
    {
        public class AnimeImageUrlResolver : IValueResolver<JikanAnimeData, AnimeDto, string>
        {
            public string Resolve(JikanAnimeData source, AnimeDto destination, string destMember, ResolutionContext context)
            {
                if (source.Images?.JPG?.ImageUrl != null)
                    return source.Images.JPG.ImageUrl;

                if (source.Images?.WebP?.ImageUrl != null)
                    return source.Images.WebP.ImageUrl;

                return string.Empty;
            }
        }
        public class GamePlatformsResolver : IValueResolver<RawgGame, GameDto, List<string>>
        {
            public List<string> Resolve(RawgGame source, GameDto destination, List<string> destMember, ResolutionContext context)
            {
                return source.Platforms
                    ?.Where(p => p?.Platform != null)
                    .Select(p => p.Platform.Name)
                    .ToList() ?? new List<string>();
            }
        }
        public MappingProfile() 
        {
            // AUTH
            CreateMap<User,UserDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

            // FAVORITES

            CreateMap<FavoriteDto, UserFavorite>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_=> DateTime.UtcNow))
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<UserFavorite, FavoriteDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.ExternalId, opt => opt.MapFrom(src => src.ExternalId))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));


            // PDF
            CreateMap<UserFavorite, FavoritePdfItemDto>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
               .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
               .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
               .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ImageUrl))
               .ForMember(dest => dest.AddedDate, opt => opt.MapFrom(src => src.CreatedAt))
               .ForMember(dest => dest.ExternalId, opt => opt.MapFrom(src => src.ExternalId));

            // External APi
            //jikan

            CreateMap<JikanAnimeData,AnimeDto>()
                .ForMember(dest => dest.MalId, opt => opt.MapFrom(src => src.MalId))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.TitleEnglish, opt => opt.MapFrom(src => src.TitleEnglish ?? src.Title))
                .ForMember(dest => dest.TitleJapanese, opt => opt.MapFrom(src => src.TitleJapanese ?? src.Title))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom<AnimeImageUrlResolver>())
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score ?? 0))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Episodes, opt => opt.MapFrom(src => src.Episodes ?? 0))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Genres, opt => opt.MapFrom(src =>
                    src.Genres.Select(g => g.Name).ToList()));

            CreateMap<RawgGame, GameDto>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
               .ForMember(dest => dest.Released, opt => opt.MapFrom(src => src.Released))
               .ForMember(dest => dest.BackgroundImage, opt => opt.MapFrom(src => src.BackgroundImage))
               .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating))
               .ForMember(dest => dest.Platforms, opt => opt.MapFrom<GamePlatformsResolver>())
               .ForMember(dest => dest.Genres, opt => opt.MapFrom(src =>
                   src.Genres.Select(g => g.Name).ToList()));
        }
    }
}
