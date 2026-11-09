# Loja Compre Bem — API e app

Atividade de Construção de Software: catálogo com pelo menos 60 produtos, CRUD completo pelo app, mensagens de erro e scroll infinito.

Repositório: [Caio1137/loja-compre-bem](https://github.com/Caio1137/loja-compre-bem).

O app Expo/React Native permanece na raiz. A API Spring Boot foi incorporada em [`api/`](api), a partir de [Caio1137/loja-compre-bem-api, revisão 498b317](https://github.com/Caio1137/loja-compre-bem-api/tree/498b3173c1d448ad33c8734a9585e8d89eb05de2). Assim, os dois projetos e as capturas ficam na mesma entrega, sem depender de outro clone.

## Executar no Windows

Requisitos: Node.js 22.13 ou superior e JDK 21. O Maven Wrapper já acompanha a API.

Na pasta do projeto:

```powershell
npm ci
npm run api
```

Em um segundo terminal, na mesma pasta:

```powershell
npm run web -- --port 8081
```

Abra **http://localhost:8081**. A API fica em **http://localhost:8080/api/v1/produtos** e a documentação em **http://localhost:8080/swagger-ui.html**.

O comando `npm run api` procura o JDK 21 em `C:\Program Files\Java\jdk-21` quando `JAVA_HOME` não foi definido. Para outra instalação, configure `JAVA_HOME` para seu JDK antes de executar. Também é possível iniciar diretamente com `cd api` e `.\mvnw.cmd spring-boot:run`.

## Usar no celular

Copie `.env.example` para `.env.local` e coloque o IP do computador na rede:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api/v1
```

Com API e celular na mesma rede, execute `npm start` e leia o QR Code no Expo Go compatível com o SDK 57. Reinicie o Expo após alterar a variável. No emulador Android, use `http://10.0.2.2:8080/api/v1`.

## Requisitos implementados

| Requisito | Implementação |
| --- | --- |
| Pelo menos 60 produtos na API | A carga inicial cadastra 60 produtos de seis categorias quando o banco está vazio. O banco H2 em `api/data/` persiste os dados entre execuções. A carga não duplica produtos ao reiniciar. |
| CRUD completo pelo app | Listagem e detalhes; cadastro com nome, preço, categoria, estoque, descrição e imagem; edição com dados preenchidos; exclusão com confirmação e opção de cancelar. Todas as operações usam a API. |
| Tratamento de erro | Validação no app e na API; mensagens para 400, 404, erros do servidor e falhas de conexão; limite de 10 segundos por chamada; opção de tentar novamente sem tela em branco. Falha ao salvar mantém os campos preenchidos. |
| Scroll infinito | `FlatList.onEndReached` busca páginas de 20 produtos. Há trava contra chamadas simultâneas, ordenação por nome e id, fim da lista, preservação dos itens quando a próxima página falha e cancelamento de respostas de buscas antigas. |

Favoritos e última busca continuam salvos no aparelho com AsyncStorage. Os controles de quantidade nos cards representam a seleção local; o estoque da API é alterado no formulário de edição.

## API

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/api/v1/produtos` | Página; aceita `page`, `size`, `sort` e `busca` por nome. |
| GET | `/api/v1/produtos/filtro?filtro=...&page=0&size=20` | Página filtrada por nome, descrição ou categoria. |
| GET | `/api/v1/produtos/{produtoId}` | Produto ou 404. |
| POST | `/api/v1/produtos` | Produto criado, status 201. |
| PUT | `/api/v1/produtos/{produtoId}` | Produto atualizado ou 404. |
| DELETE | `/api/v1/produtos/{produtoId}` | Status 204 sem corpo, ou 404. |

As páginas têm o formato `{ "content": [...], "page": { "size": 20, "number": 0, "totalElements": 60, "totalPages": 3 } }`. A numeração começa em zero. O máximo é 50 itens por página. Erros de dados e de produto inexistente retornam `{ "status": 400, "mensagem": "..." }` (ou 404).

## Verificação e capturas

```powershell
npm run typecheck
npm run build:web
cd api
.\mvnw.cmd --batch-mode --no-transfer-progress test
cd ..
npm run test:e2e
```

Os testes de navegador usam Google Chrome instalado e iniciam a API e o Expo automaticamente se ainda não estiverem rodando. Em uma máquina sem Chrome, use `npx playwright install chromium` e defina `$env:PLAYWRIGHT_CHANNEL = 'chromium'` antes do teste.

Os testes da API usam um banco em memória separado do banco do app. Os testes do app usam o banco local de desenvolvimento, esperam os 60 produtos iniciais e criam/excluem somente o produto de demonstração. Use uma cópia de desenvolvimento para executá-los se já tiver alterado o catálogo.

O roteiro, as capturas reais do app na versão web e as evidências estão em **[`entrega/README.md`](entrega/README.md)**. As capturas são versionadas; arquivos de build, banco local e resultados temporários de testes não entram no Git.

## Estrutura

```text
App.tsx                    Navegação, incluindo links diretos para produtos
src/components/            Card de produto
src/hooks/                 Paginação e controle de requisições
src/screens/               Lista, detalhe e formulário de cadastro/edição
src/services/              Cliente HTTP, CRUD e preferências locais
api/                       API Java/Spring Boot, carga inicial e testes
tests/e2e/                 Testes do app contra a API e geração das capturas
entrega/                   Roteiro, capturas e evidências da atividade
```
