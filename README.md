#  CatalogoHub

Sistema completo para gerenciamento de favoritos de jogos e animes, utilizando uma arquitetura moderna com separação entre API e Frontend.

---

##  Estrutura do Projeto

O repositório está organizado da seguinte forma:

* **`backend/`**: API construída com ASP.NET Core 10, PostgreSQL e JWT.
* **`frontend/`**: Aplicação Next.js (em desenvolvimento).

---

##  Tecnologias (Backend)

* **.NET 10** & **ASP.NET Core Web API**
* **PostgreSQL** com **Entity Framework Core 10**
* **JWT (JSON Web Tokens)** para autenticação segura.
* **Swagger/OpenAPI** para documentação interativa.
* **RAWG API** para integração de dados de jogos em tempo real.

---

##  Funcionalidades

- **✅ Autenticação JWT**: Registro e login de usuários.
- **✅ CRUD de Favoritos**: Gerenciamento completo de itens favoritos.
- **✅ Integração RAWG**: Busca global de jogos.
- **✅ Autorização**: Acesso restrito aos dados do próprio usuário.
- **✅ CORS**: Configurado para comunicação segura com o frontend.

---

##  Configuração do Ambiente

### Pré-requisitos

* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* [PostgreSQL 15+](https://www.postgresql.org/download/)
* [RAWG API Key](https://rawg.io/apidocs)

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone <https://github.com/MuYukio/CatalogoHub/>
    cd CatalogoHub
    ```

2.  **Configuração do Backend**
    Navegue até a pasta da API:
    ```bash
    cd backend/CatalogoHub.api
    ```

3.  **Variáveis de Ambiente**
    Configure o arquivo `appsettings.Development.json` com suas credenciais:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Database=CatalogoHubDb;Username=seu_usuario;Password=sua_senha"
      },
      "ExternalApis": {
        "Rawg": {
          "ApiKey": "sua_chave_aqui"
        }
      },
      "Jwt": {
        "Key": "sua_chave_secreta_com_no_minimo_32_caracteres"
      }
    }
    ```

4.  **Banco de Dados**
    Execute as migrações para criar as tabelas:
    ```bash
    dotnet ef database update
    ```

5.  **Rodar a Aplicação**
    ```bash
    dotnet run
    ```

6.  **Acesse o Swagger**
    * Documentação: `http://localhost:5114/swagger`

---

## 📝 Licença

Este projeto está sob a licença MIT.
