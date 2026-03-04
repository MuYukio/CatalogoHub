using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.AspNetCore.Authorization;

using System.Reflection; 

namespace CatalogoHub.api.Infrastructure.Swagger
{
    public class SecurityRequirementsOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var declaringType = context.MethodInfo.DeclaringType;
            if (declaringType == null) return;

            var hasAuthorize =
                declaringType.GetCustomAttributes(true)
                    .OfType<AuthorizeAttribute>().Any()
                || context.MethodInfo.GetCustomAttributes(true)
                    .OfType<AuthorizeAttribute>().Any();

            if (!hasAuthorize) return;

            operation.Security = new List<OpenApiSecurityRequirement>
    {
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new List<string>()
            }
        }
    };
        }
    }
}