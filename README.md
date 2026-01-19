# CatalogoHub

Sistema completo para gerenciamento de favoritos de jogos e animes, desenvolvido com uma API RESTful moderna e funcionalidades de geração de relatórios em PDF.

## Visao Geral

O CatalogoHub e uma solucao backend robusta que permite aos usuarios catalogar seus interesses em entretenimento. O sistema integra-se a APIs publicas (RAWG e Jikan) para fornecer dados em tempo real, garante seguranca atraves de autenticacao JWT e oferece recursos avancados como exportacao de catalogos para PDF.

---

## Funcionalidades Implementadas

### Autenticacao e Autorizacao
- Registro e login de usuarios com JWT (JSON Web Tokens).
- Tokens seguros com validade configuravel e protecao de rotas por autorizacao.
- Isolamento de dados garantindo que cada usuario acesse apenas seus proprios registros.

### Gerenciamento de Favoritos
- CRUD completo de favoritos para jogos e animes.
- Cada usuario gerencia sua propria lista de forma independente.
- Validacao de dados rigorosa com Data Annotations.

### Integracao com APIs Externas
- RAWG API: Catalogo completo para busca de jogos.
- Jikan API: Catalogo completo para busca de animes.
- Busca em tempo real com paginacao e tratamento de erros.

### Geracao de Relatorios em PDF
- PDF profissional gerado com a biblioteca QuestPDF.
- Layout responsivo com resumo estatistico da colecao.
- Download automatico via endpoint dedicado.

---

## Arquitetura Tecnica

### Backend Stack
- Framework: ASP.NET Core 10
- Banco de Dados: PostgreSQL
- ORM: Entity Framework Core 10 (com Migrations)
- Autenticacao: JWT (JSON Web Tokens)
- Relatorios: QuestPDF
- Mapeamento: AutoMapper
- Documentacao: Swagger / OpenAPI

### Padroes de Design
- Arquitetura em Camadas (Controllers, Domain, Application, Infrastructure).
- Repository Pattern para abstracao do banco de dados.
- DTOs (Data Transfer Objects) para trafego de dados.
- Injecao de Dependencia nativa.
- Tratamento centralizado de excecoes.

---

## Configuracao do Ambiente

### Pre-requisitos
- .NET 10 SDK
- PostgreSQL 15+
- RAWG API Key (gratuita)

### Instalacao e Execucao

1. Clonar o Repositorio
    git clone https://github.com/MuYukio/CatalogoHub.git
    cd CatalogoHub

2. Configurar o Banco de Dados
    Voce pode utilizar um banco local ou via Docker:

    Opcao via Docker:
    docker run --name catalogohub-db -e POSTGRES_PASSWORD=senha -p 5432:5432 -d postgres:15

    Opcao Local:
    createdb CatalogoHubDb

3. Variaveis de Ambiente
    Edite o arquivo backend/CatalogoHub.api/appsettings.Development.json com suas credenciais:

    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=CatalogoHubDb;Username=postgres;Password=sua_senha"
      },
      "Jwt": {
        "Key": "sua_chave_secreta_minimo_32_caracteres_aqui",
        "Issuer": "CatalogoHubApi",
        "Audience": "CatalogoHubFrontend"
      },
      "ExternalApis": {
        "Rawg": {
          "ApiKey": "sua_chave_rawg_aqui"
        }
      }
    }

4. Migrations e Execucao
    cd backend/CatalogoHub.api
    dotnet ef database update
    dotnet run

---

## Documentacao da API

Apos iniciar a aplicacao, os enderecos de acesso sao:

- Swagger UI: http://localhost:5114/swagger
- API Base: http://localhost:5114/api

---

## Licenca

Este projeto esta licenciado sob a licenca MIT.
