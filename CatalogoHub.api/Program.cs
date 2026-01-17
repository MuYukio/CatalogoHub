using CatalogoHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. ADICIONAR: Configuração para API
builder.Services.AddControllers(); // ← Para API controllers
builder.Services.AddEndpointsApiExplorer(); // ← Para Swagger
builder.Services.AddSwaggerGen(); // ← Gera documentação automática
builder.Services.AddAutoMapper(typeof(Program));

// 2. ADICIONAR: CORS para o Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // URL do Next.js
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// 3. MANTER: Configuração do banco (já estava correto)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();

// 4. CONFIGURAR: Pipeline de desenvolvimento
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Acesse em /swagger
    app.UseSwaggerUI();
}
else
{
    // Em produção, mantemos tratamento de erro
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// 5. ADICIONAR: CORS (importante vir antes de UseAuthorization)
app.UseCors("AllowNextJs");

app.UseAuthorization();

// 6. ADICIONAR: Mapeamento de controllers API
app.MapControllers(); // ← Isso substitui MapRazorPages

app.Run();