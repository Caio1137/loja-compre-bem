# API Loja Compre Bem

API Spring Boot que fornece o catálogo de produtos da Loja Compre Bem. Projeto feito a partir do repositório da turma ([jonatasEdward/loja-compre-bem-api](https://github.com/jonatasEdward/loja-compre-bem-api)).

O app que consome esta API está em [Caio1137/loja-compre-bem](https://github.com/Caio1137/loja-compre-bem).

## Tecnologias

- Java 21
- Spring Boot (Web MVC, Data JPA)
- H2 gravando em arquivo (`./data`)
- springdoc-openapi (Swagger UI)

## Como executar

```bash
./mvnw spring-boot:run
```

No Windows: `mvnw.cmd spring-boot:run`.

A API sobe em `http://localhost:8080`. Ao iniciar com o banco vazio, ela cadastra 60 produtos de escritório.

- Swagger UI: http://localhost:8080/swagger-ui.html
- Console do H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/comprebem`, usuário `sa`, sem senha)

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/v1/produtos` | Lista paginada (`page`, `size`, `sort`). 20 por página por padrão, no máximo 50. Aceita `busca` para filtrar pelo nome sem diferenciar maiúsculas de minúsculas. |
| GET | `/api/v1/produtos/filtro` | Lista paginada filtrando por `filtro` no nome, na descrição ou na categoria, sem diferenciar maiúsculas de minúsculas. Sem `filtro`, devolve todos. |
| GET | `/api/v1/produtos/{id}` | Devolve um produto. Responde 404 quando o id não existe. |
| POST | `/api/v1/produtos` | Cadastra um produto (201). |
| PUT | `/api/v1/produtos/{produtoId}` | Atualiza um produto. |
| DELETE | `/api/v1/produtos/{produtoId}` | Exclui um produto (204). Responde 404 quando o id não existe. |

As páginas são serializadas no formato `{ content, page }` (`spring.data.web.pageable.serialization-mode=via_dto`), com `page.size`, `page.number`, `page.totalElements` e `page.totalPages`.

Dados inválidos retornam 400 com `{ status, mensagem }`. Nome e categoria são obrigatórios, preço precisa ser positivo com até duas casas decimais, e estoque precisa ser inteiro não negativo. Identificadores e JSON inválidos também retornam 400. As páginas têm ordenação padrão por nome e id para manter a ordem entre produtos com o mesmo nome.

## Testes

```powershell
.\mvnw.cmd --batch-mode --no-transfer-progress test
```

Os sete testes de integração usam banco H2 em memória e não alteram o banco em arquivo do app. O roteiro completo e as capturas estão em [`../entrega/README.md`](../entrega/README.md).

## Roteiro de apresentação

1. `GET /api/v1/produtos`: 20 produtos e `page.totalElements` igual a 60.
2. `GET /api/v1/produtos?page=2`: última página (a numeração começa em 0).
3. `GET /api/v1/produtos?size=500`: a resposta vem com 50 itens, respeitando o limite.
4. `GET /api/v1/produtos?busca=cadeira`: produtos com "cadeira" no nome, em qualquer combinação de maiúsculas e minúsculas.
5. `GET /api/v1/produtos/{id}` com um id da lista (200) e com `00000000-0000-0000-0000-000000000000` (404).
