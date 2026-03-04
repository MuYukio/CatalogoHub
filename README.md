#  CatalogoHub

> Catálogo pessoal de jogos e animes com autenticação, favoritos e exportação em PDF.

![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

##  Visão Geral

O **CatalogoHub** é uma aplicação fullstack que permite aos usuários descobrir, catalogar e organizar seus jogos e animes favoritos. O sistema integra as APIs públicas [RAWG](https://rawg.io/apidocs) e [Jikan](https://docs.api.jikan.moe/) para dados em tempo real, protege os dados com autenticação JWT e oferece exportação do catálogo para PDF.

---

##  Funcionalidades

###  Autenticação e Autorização
- Registro e login com **JWT (JSON Web Tokens)**
- Tokens com validade configurável
- Proteção de rotas — cada usuário acessa apenas seus próprios dados

###  Gerenciamento de Favoritos
- CRUD completo de favoritos para jogos e animes
- Listas independentes por usuário
- Validação de dados com Data Annotations

###  Integração com APIs Externas
- **RAWG API** — busca de jogos com paginação e filtragem por conteúdo adulto
- **Jikan API** — busca de animes e temporada atual em exibição
- Tratamento de erros e fallback em todas as integrações

###  Exportação em PDF
- Relatório profissional gerado com **QuestPDF**
- Layout com resumo estatístico da coleção
- Download via endpoint dedicado

###  Frontend
- Interface moderna com **Next.js 15** e **Tailwind CSS**
- Carrossel interativo com suporte a imagens portrait (animes) e landscape (jogos)
- Modo escuro/claro
- Busca com debounce e paginação infinita

---

##  Arquitetura
```
CatalogoHub/
├── backend/
│   └── CatalogoHub.api/
│       ├── Controllers/          # Endpoints da API
│       ├── Domain/
│       │   ├── DTOs/             # Objetos de transferência de dados
│       │   └── Entities/         # Modelos do banco de dados
│       └── Infrastructure/
│           ├── Auth/             # JWT Service
│           ├── Data/             # AppDbContext + Migrations
│           ├── ExternalApis/     # RawgService + JikanService
│           ├── Mappings/         # AutoMapper profiles
│           ├── Pdf/              # QuestPDF service
│           └── Swagger/          # Configuração do Swagger
└── frontend/
    ├── app/                      # Páginas Next.js (App Router)
    ├── components/               # Componentes reutilizáveis
    ├── hooks/                    # Custom hooks (React Query)
    ├── services/                 # Camada de chamadas à API
    └── types/                    # Tipagens TypeScript
```

###  Stack Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| ASP.NET Core | 10 | Framework principal |
| PostgreSQL | 15+ | Banco de dados |
| Entity Framework Core | 10 | ORM + Migrations |
| JWT Bearer | — | Autenticação |
| QuestPDF | — | Geração de PDF |
| AutoMapper | — | Mapeamento de objetos |
| BCrypt.Net | — | Hash de senhas |
| Swagger / OpenAPI | — | Documentação |

###  Stack Frontend
| Tecnologia | Uso |
|---|---|
| Next.js 15 | Framework React |
| Tailwind CSS | Estilização |
| TanStack Query | Cache e chamadas à API |
| shadcn/ui | Componentes UI |

---

##  Configuração do Ambiente

### Pré-requisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/)
- [RAWG API Key](https://rawg.io/apidocs) (gratuita)

---

###  Instalação

#### 1. Clonar o repositório
```bash
git clone https://github.com/MuYukio/CatalogoHub.git
cd CatalogoHub
```

#### 2. Configurar o banco de dados

**Via Docker (recomendado):**
```bash
docker run --name catalogohub-db \
  -e POSTGRES_PASSWORD=sua_senha \
  -p 5432:5432 \
  -d postgres:15
```

**Local:**
```bash
createdb CatalogoHubDb
```

#### 3. Configurar variáveis de ambiente

Edite `backend/CatalogoHub.api/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=CatalogoHubDb;Username=postgres;Password=sua_senha"
  },
  "Jwt": {
    "Key": "sua_chave_secreta_minimo_32_caracteres_aqui",
    "Issuer": "CatalogoHubApi",
    "Audience": "CatalogoHubFrontend",
    "ExpireHours": "24"
  },
  "ExternalApis": {
    "Rawg": {
      "ApiKey": "sua_chave_rawg_aqui",
      "BaseUrl": "https://api.rawg.io/api"
    }
  }
}
```

>  **Nunca suba o `appsettings.json` com credenciais reais para o repositório.** Use `appsettings.Development.json` localmente e variáveis de ambiente em produção.

#### 4. Rodar o backend
```bash
cd backend/CatalogoHub.api
dotnet ef database update
dotnet run
```

#### 5. Rodar o frontend
```bash
cd frontend/catalogohub
npm install
npm run dev
```

---

##  Endpoints da API

Após iniciar a aplicação:

| | URL |
|---|---|
| Swagger UI | `http://localhost:5114/swagger` |
| API Base | `http://localhost:5114/api` |

### Principais rotas
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Registro de usuário |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Perfil do usuário autenticado |
| `GET` | `/api/games/recent` | Jogos lançados recentemente |
| `GET` | `/api/games/popular` | Jogos mais bem avaliados |
| `GET` | `/api/games/search?query=` | Busca de jogos |
| `GET` | `/api/animes/season/current` | Animes da temporada atual |
| `GET` | `/api/animes/popular` | Animes mais populares |
| `GET` | `/api/animes/search?query=` | Busca de animes |
| `GET` | `/api/favorites` | Lista de favoritos do usuário |
| `POST` | `/api/favorites` | Adicionar favorito |
| `DELETE` | `/api/favorites/{id}` | Remover favorito |

---

##  Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido  por <a href="https://github.com/MuYukio">MuYukio</a>
</p>
