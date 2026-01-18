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

##  Funcionalidades Atuais

- **✅ Autenticação JWT**: Registro e login de usuários.
- **✅ CRUD de Favoritos**: Gerenciamento completo de itens favoritos.
- **✅ Integração RAWG**: Busca global de jogos.
- **✅ Autorização**: Acesso restrito aos dados do próprio usuário.
- **✅ CORS**: Configurado para comunicação segura com o frontend.

---

##  Próximas Funcionalidades (Roadmap)

- [ ] **Integração com Jikan API**: Suporte completo para busca e favoritos de animes.
- [ ] **Geração de PDF**: Relatórios de listas de favoritos usando **QuestPDF**.
- [ ] **Sistema de Avaliação**: Notas e ratings personalizados para cada item.
- [ ] **Filtros Avançados**: Ordenação por data, gênero e plataforma.
- [ ] **Performance**: Implementação de cache distribuído com **Redis**.
- [ ] **Infraestrutura**: Containerização do ambiente com **Docker**.
- [ ] **Interface**: Desenvolvimento do Frontend moderno em **Next.js**.

---

##  Configuração do Ambiente

### Pré-requisitos

* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* [PostgreSQL 15+](https://www.postgresql.org/download/)
* [RAWG API Key](https://rawg.io/apidocs)

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone <link-do-seu-repositorio>
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

---

##  Contribuição



1. Faça um **Fork** do projeto.
2. Crie uma **Branch** para sua Feature (`git checkout -b feature/NovaFeature`).
3. Faça o **Commit** de suas mudanças (`git commit -m 'Add: Nova Feature'`).
4. Faça o **Push** para a Branch (`git push origin feature/NovaFeature`).
5. Abra um **Pull Request**.

---

##  Autor

Desenvolvido para demonstrar competências técnicas em:
* **ASP.NET Core Web API** (Arquitetura em Camadas)
* **Integração de APIs Externas** e **Autenticação JWT**
* **Entity Framework Core** & **PostgreSQL**

---

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
