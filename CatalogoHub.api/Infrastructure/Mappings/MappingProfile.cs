using AutoMapper;
using CatalogoHub.api.Domain.Entities;
using CatalogoHub.api.Domain.DTOs;


namespace CatalogoHub.api.Infrastructure.Mappings

{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<CreateFavoriteDto, UserFavorite>()
           .ForMember(dest => dest.UserId, opt => opt.Ignore());

            CreateMap<UserFavorite, FavoriteDto>();
        }
    }
}
