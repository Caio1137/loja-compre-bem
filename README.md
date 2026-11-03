# Loja Compre Bem

Projeto de prática da disciplina de Construção de Software. O app lista produtos para escritório, mostra o detalhe de cada item e permite cadastrar produtos. Os produtos vêm da API Spring Boot da loja.

## API

A API fica no repositório [Caio1137/loja-compre-bem-api](https://github.com/Caio1137/loja-compre-bem-api). Ela precisa estar rodando em `http://localhost:8080` antes de abrir o app:

```bash
./mvnw spring-boot:run
```

O app usa estes endpoints:

- `GET /api/v1/produtos/filtro?filtro=...&page=...&size=20`: lista e busca. O app mostra o `content` da página.
- `GET /api/v1/produtos/{produtoId}`: detalhe do produto.
- `POST /api/v1/produtos`: cadastro.

## Como executar

```bash
npm install
npm run web
```

Para usar no celular com o Expo Go, troque `localhost` pelo IP do computador na constante `API_URL` de [`src/services/api.ts`](src/services/api.ts) e rode `npm start`.

Para conferir os tipos:

```bash
npx tsc --noEmit
```

## Organização do código

```
App.tsx                      navegação
src/
  types/                     Produto (com produtoId: string), Page<T> e RootStackParamList
  services/
    api.ts                   único arquivo que chama fetch, com a URL da API
    produtosService.ts       busca paginada no /filtro, busca por id e cadastro
    preferenciasStorage.ts   favoritos e última busca no AsyncStorage
  components/ProdutoItem.tsx
  screens/                   lista, detalhe e cadastro
```
