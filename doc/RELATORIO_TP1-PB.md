# Relatório Técnico — TP1: Monólito Simples com Spring Boot

> **Trimestre:** 26E2 · **Bloco:** Engenharia de Softwares Escaláveis  
> **Disciplina:** Projeto de Bloco: Engenharia de Softwares Escaláveis (DR5)  
> **Instituição:** Faculdade Infnet  
> **Aluno:** André Luis Becker  
> **Data de Entrega:** 04/Junho/2026  

---

## Sumário

1. [Introdução](#1-introdução)
2. [Arquitetura da Solução](#2-arquitetura-da-solução)
3. [Diagrama de Sequência](#3-diagrama-de-sequência)
4. [Modelagem DDD](#4-modelagem-ddd)
5. [Princípios SOLID](#5-princípios-solid)
6. [Design Patterns Aplicados](#6-design-patterns-aplicados)
7. [API REST](#7-api-rest)
8. [Front-End](#8-front-end)
9. [Instruções para o Repositório Git](#9-instruções-para-o-repositório-git)
10. [Como Testar](#10-como-testar)
11. [Gerenciamento de Dependências](#11-gerenciamento-de-dependências-pomxml)
12. [Referências](#12-referências)

---

## 1. Introdução

Este documento apresenta a arquitetura e as decisões técnicas da primeira entrega do Projeto de Bloco. O objetivo desta etapa é desenvolver uma aplicação monolítica utilizando Spring Boot, demonstrando domínio de arquitetura em camadas, desenvolvimento de APIs REST, princípios SOLID, modelagem DDD e integração com um front-end React/Next.js.

O domínio escolhido é a **Plataforma Educacional Infnet Hub** — uma rede social acadêmica com feed de publicações, vagas de carreira, comentários e curtidas. Esta primeira entrega serve como base evolutiva para as etapas seguintes (microsserviços, eventos, produção).

---

## 2. Arquitetura da Solução

### 2.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cliente (Browser)                           │
│                  Next.js 15 · TypeScript                        │
│                    localhost:3000                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST (JSON)
                           │ CORS permitido: localhost:3000
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Spring Boot Application                        │
│                      localhost:8080                             │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Controller  │───▶│   Service    │───▶│   Repository     │   │
│  │  (HTTP/REST) │    │  (Negócio)   │    │  (JPA/H2)        │   │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘   │
│         │                                         │             │
│  ┌──────┴──────┐                         ┌────────▼─────────┐   │
│  │    DTOs     │                         │   H2 Database    │   │
│  │ Request/    │                         │  (in-memory)     │   │
│  │ Response    │                         │  Tabelas: posts  │   │
│  │             │                         │  vagas, usuarios │   │
│  └─────────────┘                         └──────────────────┘   │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │  Exception   │    │    Config    │                           │
│  │  Handler     │    │  CorsConfig  │                           │
│  └──────────────┘    │  DataLoader  │                           │
│                      └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Diagrama de Componentes

```
com.andre.monolito_infnethub
│
├── config/
│   ├── CorsConfig           → Configuração global de CORS
│   └── DataLoader           → Carga inicial de dados (ApplicationRunner)
│
├── controller/
│   ├── UsuarioController    → Endpoints REST /api/v1/usuarios
│   ├── PostController       → Endpoints REST /api/v1/posts
│   ├── VagaController       → Endpoints REST /api/v1/vagas
│   ├── ComentarioController → Endpoints REST /api/v1/posts/{id}/comentarios
│   └── CurtidaController    → Endpoints REST /api/v1/posts/{id}/curtidas
│
├── dto/
│   ├── UsuarioRequestDTO / UsuarioResponseDTO
│   ├── PostRequestDTO / PostResponseDTO
│   ├── VagaRequestDTO / VagaResponseDTO
│   └── ComentarioRequestDTO / ComentarioResponseDTO
│
├── exception/
│   ├── ResourceNotFoundException   → Exceção de domínio (404)
│   └── GlobalExceptionHandler      → @RestControllerAdvice (tratamento centralizado)
│
├── model/
│   ├── Usuario    → Entidade JPA (@Entity, @Table("usuarios"))
│   ├── Post       → Entidade JPA (@Entity, @Table("posts"))
│   ├── Vaga       → Entidade JPA (@Entity, @Table("vagas"))
│   ├── Comentario → Entidade JPA (@Entity, @Table("comentarios"))
│   ├── Curtida    → Entidade JPA (@Entity, @Table("curtidas"))
│   ├── Papel      → Enum (ALUNO, PROFESSOR, SECRETARIA, COORDENADOR)
│   └── TipoVaga   → Enum (CLT, PJ, ESTAGIO, TRAINEE, AUTONOMO, EXTERIOR)
│
├── repository/
│   ├── UsuarioRepository    → Interface JpaRepository + queries derivadas
│   ├── PostRepository
│   ├── VagaRepository
│   ├── ComentarioRepository
│   └── CurtidaRepository
│
└── service/
    ├── UsuarioService / impl/UsuarioServiceImpl
    ├── PostService    / impl/PostServiceImpl
    ├── VagaService    / impl/VagaServiceImpl
    └── ComentarioService / impl/ComentarioServiceImpl
```

---

## 3. Diagrama de Sequência

### 3.1 Listar Todos os Posts (GET /api/v1/posts)

```
Frontend          PostController       PostService        PostRepository       H2 Database
   │                     │                   │                   │                  │
   │──GET /posts────────▶│                   │                   │                  │
   │                     │──listarTodos()───▶│                   │                  │
   │                     │                   │──findAll()───────▶│                  │
   │                     │                   │                   │──SELECT * FROM──▶│
   │                     │                   │                   │◀─List<Post>──────│
   │                     │                   │◀─List<Post>───────│                  │
   │                     │◀─List<ResponseDTO>│                   │                  │
   │◀──200 OK [JSON]─────│                   │                   │                  │
```

### 3.2 Criar Post (POST /api/v1/posts)

```
Frontend          PostController       PostService        PostRepository       H2 Database
   │                     │                   │                   │                  │
   │──POST + body───────▶│                   │                   │                  │
   │                     │ @Valid valida DTO │                   │                  │
   │                     │──criar(dto)──────▶│                   │                  │
   │                     │                   │ dto.toEntity()    │                  │
   │                     │                   │──save(post)──────▶│                  │
   │                     │                   │                   │──INSERT INTO────▶│
   │                     │                   │                   │◀─Post (id)───────│
   │                     │                   │◀─Post salvo───────│                  │
   │                     │◀─ResponseDTO──────│                   │                  │
   │◀──201 CREATED [JSON]│                   │                   │                  │
```

### 3.3 Erro — Recurso não encontrado (GET /api/v1/posts/99)

```
Frontend          PostController       PostService                     GlobalExceptionHandler
   │                     │                   │                                   │
   │──GET /posts/99─────▶│                   │                                   │
   │                     │──buscarPorId(99)─▶│                                   │
   │                     │                   │ findById(99) → empty              │
   │                     │                   │ throw ResourceNotFoundException   │
   │                     │                   │──────────────────────────────────▶│
   │                     │◀──────────────────────────────────────────────────────│
   │◀──404 Not Found─────│                   │                                   │
```

---

## 4. Modelagem DDD

### 4.1 Domain-Driven Design

| Conceito DDD          | Aplicação                                                                                 |
|-----------------------|-------------------------------------------------------------------------------------------|
| **Domain**            | Plataforma Educacional Infnet Hub                                                         |
| **Core Subdomain**    | Feed Social e Oportunidades de Carreira                                                   |
| **Support Subdomain** | Autenticação, validação e persistência                                                    |
| **Bounded Contexts**  | `Usuário` · `Post` · `Vaga`                                                               |
| **Aggregate Roots**   | `Usuario`, `Post`, `Vaga` — pontos de entrada para todas as operações                     |
| **Repositories**      | `UsuarioRepository`, `PostRepository`, `VagaRepository` — acesso sem expor infraestrutura |
| **Services**          | `UsuarioService`, `PostService`, `VagaService` — orquestram casos de uso                  |
| **DTOs**              | `*RequestDTO` / `*ResponseDTO` — anti-corruption layer entre API e domínio                |

### 4.2 Principais Entidades

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│           Usuario               │     │              Post                │
│  ─────────────────────────────  │     │  ──────────────────────────────  │
│  + id: Long (PK, auto)          │     │  + id: Long (PK, auto)           │
│  + nome: String (not null)      │1   *│  + titulo: String                │
│  + email: String (unique)       │─────│  + conteudo: TEXT (not null)     │
│  + papel: Papel (enum)          │     │  + curtidas: Integer             │
│  + escola: String               │     │  + autor: Usuario (FK)           │
│  + classe: String               │     │  + criadoEm: LocalDateTime       │
│  + criadoEm: LocalDateTime      │     └──────────────────────────────────┘
└─────────────────────────────────┘

                                        ┌──────────────────────────────────┐
┌─────────────────────────────────┐     │              Vaga                │
│          Comentario             │     │  ──────────────────────────────  │
│  ─────────────────────────────  │     │  + id: Long (PK, auto)           │
│  + id: Long (PK, auto)          │     │  + titulo: String (not null)     │
│  + conteudo: TEXT (not null)    │     │  + empresa: String (not null)    │
│  + autor: Usuario (FK)          │     │  + tipo: TipoVaga (enum)         │
│  + post: Post (FK)              │     │  + localizacao: String           │
│  + criadoEm: LocalDateTime      │     │  + ativo: boolean                │
└─────────────────────────────────┘     └──────────────────────────────────┘
```

---

## 5. Princípios SOLID

| Princípio                     | Implementação                                                                                                                                                             |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **S** — Single Responsibility | `PostController` apenas roteia HTTP. `PostServiceImpl` apenas aplica regras de negócio. `PostRepository` apenas acessa dados. Cada classe tem uma única razão para mudar. |
| **O** — Open/Closed           | `PostService`, `UsuarioService`, `VagaService` são interfaces. Novas implementações (ex: com cache ou auditoria) não alteram o contrato.                                  |
| **L** — Liskov Substitution   | `PostServiceImpl` implementa `PostService` e pode ser substituída por qualquer outra implementação sem quebrar o `PostController`.                                        |
| **I** — Interface Segregation | Cada interface de serviço expõe apenas os métodos necessários para seu domínio — `PostService` não contém operações de vaga.                                              |
| **D** — Dependency Inversion  | Controllers dependem das abstrações (`PostService`, `VagaService`), não das implementações concretas. Injeção via `@RequiredArgsConstructor` (Lombok).                    |

---

## 6. Design Patterns Aplicados

| Pattern                   | Onde                                                                                                           |
|---------------------------|----------------------------------------------------------------------------------------------------------------|
| **Repository Pattern**    | `UsuarioRepository`, `PostRepository`, `VagaRepository` (extends `JpaRepository`) — abstraem o acesso ao banco |
| **DTO Pattern**           | `*RequestDTO` / `*ResponseDTO` — separam a API do modelo interno, evitando exposição de entidades              |
| **Service Layer Pattern** | `PostService` / `PostServiceImpl`, `VagaService` / `VagaServiceImpl` — encapsulam regras de negócio            |
| **Template Method**       | `@PrePersist` / `@PreUpdate` nas entidades — hooks do ciclo de vida JPA para timestamps automáticos            |
| **Facade**                | Controllers simplificam o acesso às operações dos serviços, ocultando complexidade do domínio                  |

---

## 7. API REST

### Autoconfiguração do Spring Boot

O Spring Boot autoconfigurou automaticamente:
- `DataSource` H2 com as propriedades do `application.properties`
- `EntityManagerFactory` e `TransactionManager` (JPA)
- `DispatcherServlet` (Spring MVC)
- Conversão JSON via Jackson (`MappingJackson2HttpMessageConverter`)
- Validação via Hibernate Validator

### Iniciação do Projeto — Spring Initializr via IntelliJ

O projeto foi iniciado diretamente no IntelliJ IDEA usando o gerador Spring Boot integrado, apontando para `start.spring.io`.

![Configuração do projeto no IntelliJ — nome, grupo, artifact, Java 25 e Maven](screenshots/01_spring-initializr-IntelliJ.png)
*Spring Initializr configurado com Maven, Java 25, group `com.andre` e artifact `monolito_infnet-hub`.*

![Dependências selecionadas — Lombok, Spring Web, DevTools, Spring Data JPA](screenshots/02_spring-initializr-IntelliJ.png)
*Dependências adicionadas: Lombok, Spring Web, Spring Boot DevTools e Spring Data JPA.*

### Tabela de Endpoints

**Usuários**

| Método | URL                     | Body                | Response                   | HTTP Status |
|--------|-------------------------|---------------------|----------------------------|-------------|
| GET    | `/api/v1/usuarios`      | —                   | `List<UsuarioResponseDTO>` | 200         |
| GET    | `/api/v1/usuarios/{id}` | —                   | `UsuarioResponseDTO`       | 200 / 404   |
| POST   | `/api/v1/usuarios`      | `UsuarioRequestDTO` | `UsuarioResponseDTO`       | 201         |
| PUT    | `/api/v1/usuarios/{id}` | `UsuarioRequestDTO` | `UsuarioResponseDTO`       | 200 / 404   |
| DELETE | `/api/v1/usuarios/{id}` | —                   | —                          | 204 / 404   |

**Posts**

| Método | URL                  | Body             | Response                | HTTP Status |
|--------|----------------------|------------------|-------------------------|-------------|
| GET    | `/api/v1/posts`      | —                | `List<PostResponseDTO>` | 200         |
| GET    | `/api/v1/posts/{id}` | —                | `PostResponseDTO`       | 200 / 404   |
| POST   | `/api/v1/posts`      | `PostRequestDTO` | `PostResponseDTO`       | 201         |
| PUT    | `/api/v1/posts/{id}` | `PostRequestDTO` | `PostResponseDTO`       | 200 / 404   |
| DELETE | `/api/v1/posts/{id}` | —                | —                       | 204 / 404   |

**Curtidas**

| Método | URL                                              | Body | Response                   | HTTP Status |
|--------|--------------------------------------------------|------|----------------------------|-------------|
| GET    | `/api/v1/posts/{postId}/curtidas`                | —    | `List<CurtidaResponseDTO>` | 200         |
| POST   | `/api/v1/posts/{postId}/curtidas?usuarioId={id}` | —    | `{ curtido, total }`       | 200         |

**Vagas**

| Método | URL                         | Body             | Response                | HTTP Status |
|--------|-----------------------------|------------------|-------------------------|-------------|
| GET    | `/api/v1/vagas`             | —                | `List<VagaResponseDTO>` | 200         |
| GET    | `/api/v1/vagas/{id}`        | —                | `VagaResponseDTO`       | 200 / 404   |
| GET    | `/api/v1/vagas/tipo/{tipo}` | —                | `List<VagaResponseDTO>` | 200         |
| POST   | `/api/v1/vagas`             | `VagaRequestDTO` | `VagaResponseDTO`       | 201         |
| PUT    | `/api/v1/vagas/{id}`        | `VagaRequestDTO` | `VagaResponseDTO`       | 200 / 404   |
| DELETE | `/api/v1/vagas/{id}`        | —                | —                       | 204 / 404   |

**Comentários**

| Método | URL                                       | Body                   | Response                      | HTTP Status |
|--------|-------------------------------------------|------------------------|-------------------------------|-------------|
| GET    | `/api/v1/posts/{postId}/comentarios`      | —                      | `List<ComentarioResponseDTO>` | 200         |
| POST   | `/api/v1/posts/{postId}/comentarios`      | `ComentarioRequestDTO` | `ComentarioResponseDTO`       | 201         |
| PUT    | `/api/v1/posts/{postId}/comentarios/{id}` | `ComentarioRequestDTO` | `ComentarioResponseDTO`       | 200 / 404   |
| DELETE | `/api/v1/posts/{postId}/comentarios/{id}` | —                      | —                             | 204 / 404   |

---

## 8. Front-End

### Tecnologia
- **Next.js 15** com App Router
- **TypeScript** para tipagem estática
- **CSS Modules** para estilização escopada
- **React 19** com hooks (`useState`, `useEffect`, `useCallback`)

### Funcionalidades
- Feed de posts com curtidas e comentários em tempo real
- Listagem de vagas com filtro por tipo (CLT, Estágio, PJ, Trainee…)
- Badges de papel do usuário (Aluno, Professor, Secretaria, Coordenador) no feed e comentários
- Sidebar colapsável (mini 64px / expandida 264px) com ícones lucide-react
- Painel esquerdo com calendário acadêmico e lista de tarefas
- Painel direito com atendimento institucional e grupos
- Notificações toast para todas as interações
- Popups de notificações e mensagens no header
- Busca global com atalho de teclado (⌘K / Ctrl+K) e dropdown de sugestões em tempo real
- Página de login com seleção de perfil e foto de fundo (Unsplash)
- Estados de loading, erro e tratamento de exceções

### Comunicação com o Back-End
```
frontend/src/services/
  ├── usuarioService.ts  → fetch() http://localhost:8080/api/v1/usuarios
  ├── postService.ts     → fetch() http://localhost:8080/api/v1/posts
  └── vagaService.ts     → fetch() http://localhost:8080/api/v1/vagas
```

### Screenshots da Interface

![Tela de acesso — seleção de perfil institucional](screenshots/tela_acesso.png)
*Tela de login com seleção de perfil. Usuários são carregados via `GET /api/v1/usuarios` ao montar o componente.*

![Feed principal — publicações, curtidas e comentários](screenshots/feed_infnetHub.png)
*Feed com publicações, sistema de curtidas, comentários, sidebar com calendário acadêmico e painel de atendimento institucional.*

### Ativos Visuais

| Asset                            | Autor                                                     | Licença                                          |
|----------------------------------|-----------------------------------------------------------|--------------------------------------------------|
| Foto de fundo da página de login | [Meredith Spencer](https://unsplash.com/@meredithspencer) | [Unsplash License](https://unsplash.com/license) |

Foto: *"Um grupo de pessoas andando em uma calçada"*  
Disponível em: https://unsplash.com/pt-br/fotografias/um-grupo-de-pessoas-andando-em-uma-calcada-QfE2FAW_oPI  
A Unsplash License permite uso gratuito para fins comerciais e não comerciais, sem necessidade de atribuição (atribuição encorajada).

---

## 9. Instruções para o Repositório Git

> As operações abaixo devem ser executadas **manualmente** pelo desenvolvedor.

### Inicializar repositório
```bash
git init
git branch -M main
```

### Adicionar os arquivos e fazer o primeiro commit
```bash
git add README.md LICENSE docker-compose.yml Dockerfile pom.xml
git add .gitignore .gitattributes .mvn/ mvnw mvnw.cmd
git add src/ frontend/ bruno/ doc/
git commit -m "feat: implementação do monolito Spring Boot - TP1"
```

### Adicionar o repositório remoto e enviar
```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

---

## 10. Como Testar

### Via Bruno
1. Abrir o Bruno
2. Clicar em **Open Collection** e selecionar a pasta `bruno/` do projeto
3. Selecionar o environment **local** (canto superior direito)
4. Executar as requisições nas pastas: **Usuarios**, **Posts**, **Vagas** e **Comentarios**

### Via H2 Console
1. Iniciar o back-end
2. Acessar: http://localhost:8080/h2-console
3. JDBC URL: `jdbc:h2:mem:infnethubdb`
4. User: `sa` | Password: *(vazio)*
5. Exemplos de queries:
   ```sql
   SELECT * FROM USUARIOS;
   SELECT * FROM POSTS;
   SELECT * FROM VAGAS;
   SELECT * FROM COMENTARIOS;
   SELECT * FROM CURTIDAS;
   ```

---

## 11. Gerenciamento de Dependências (pom.xml)

| Dependência                      | Versão  | Finalidade                               |
|----------------------------------|---------|------------------------------------------|
| `spring-boot-starter-web`        | 4.0.6   | Spring MVC + Tomcat embutido             |
| `spring-boot-starter-data-jpa`   | 4.0.6   | JPA + Hibernate                          |
| `spring-boot-starter-validation` | 4.0.6   | Bean Validation (Jakarta)                |
| `h2`                             | runtime | Banco de dados em memória                |
| `spring-boot-devtools`           | runtime | Hot reload em desenvolvimento            |
| `lombok`                         | —       | Redução de boilerplate (@Data, @Builder) |
| `spring-boot-starter-test`       | test    | JUnit 5 + MockMvc + AssertJ              |

---

## 12. Referências

### Arquitetura e Design

EVANS, Eric. **Domain-Driven Design: Tackling Complexity in the Heart of Software**. Addison-Wesley, 2003.  
Fundamenta a abordagem de Bounded Context, Aggregate Root e Repository aplicados ao domínio da Plataforma Infnet Hub.

FOWLER, Martin. **Patterns of Enterprise Application Architecture**. Addison-Wesley, 2002.  
Base para os padrões Repository Pattern, Service Layer e DTO aplicados na separação das camadas da aplicação.

GAMMA, Erich; HELM, Richard; JOHNSON, Ralph; VLISSIDES, John. **Design Patterns: Elements of Reusable Object-Oriented Software**. Addison-Wesley, 1994.  
Referência para os padrões Facade (Controller simplifica o acesso ao Service) e Template Method (`@PrePersist` / `@PreUpdate`).

MARTIN, Robert C. **Agile Software Development: Principles, Patterns, and Practices**. Prentice Hall, 2002.  
Fonte dos princípios SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) aplicados em todas as camadas.

MARTIN, Robert C. **Clean Architecture: A Craftsman's Guide to Software Structure and Design**. Prentice Hall, 2017.  
Embasamento da separação em camadas e da regra de dependência: camadas internas não conhecem as externas.

### APIs REST

FIELDING, Roy T. **Architectural Styles and the Design of Network-based Software Architectures**. Dissertação de Doutorado, University of California, Irvine, 2000.  
Define os constraints da arquitetura REST adotada nas APIs `/api/v1/posts`, `/api/v1/vagas` e demais endpoints da aplicação.

RICHARDSON, Leonard; RUBY, Sam. **RESTful Web Services**. O'Reilly Media, 2007.  
Boas práticas de nomenclatura de rotas, uso correto de verbos HTTP e códigos de status (200, 201, 204, 404).

### Tecnologias

WALLS, Craig. **Spring Boot in Action**. Manning Publications, 2015.  
Referência prática para autoconfiguração do Spring Boot, Spring MVC, Spring Data JPA e Bean Validation.

VERNON, Vaughn. **Implementing Domain-Driven Design**. Addison-Wesley, 2013.  
Aprofundamento na implementação prática de DDD com repositórios e serviços de domínio.

### Documentação Oficial

SPRING FRAMEWORK. **Spring Boot Reference Documentation**. Disponível em: https://docs.spring.io/spring-boot/docs/current/reference/html/. Acesso em: jun. 2026.

ORACLE. **Java Platform, Standard Edition Documentation**. Disponível em: https://docs.oracle.com/en/java/. Acesso em: jun. 2026.

VERCEL. **Next.js Documentation**. Disponível em: https://nextjs.org/docs. Acesso em: jun. 2026.

HIBERNATE. **Hibernate ORM Documentation**. Disponível em: https://hibernate.org/orm/documentation/. Acesso em: jun. 2026.

### Ativos Visuais

SPENCER, Meredith. **Um grupo de pessoas andando em uma calçada** [fotografia]. Unsplash, 2020.  
Disponível em: https://unsplash.com/pt-br/fotografias/um-grupo-de-pessoas-andando-em-uma-calcada-QfE2FAW_oPI.  
Licença: Unsplash License — uso gratuito comercial e não comercial, sem necessidade de atribuição.
