# Entrega — Loja Compre Bem

**Repositório:** https://github.com/Caio1137/loja-compre-bem

**Data da verificação:** 09/11/2026

API e app estão neste repositório. O app fica na raiz e a API em [`api/`](../api). O commit da atividade pode ser identificado com `git log -1 --oneline` depois de concluir a entrega.

## Capturas dos quatro requisitos

As imagens foram obtidas do app Expo executado no navegador Chrome, com área de 430 × 932 pixels. São capturas da interface em funcionamento, usando a API Spring Boot local e o banco H2 em arquivo.

| Item solicitado | Capturas |
| --- | --- |
| 1. Pelo menos 60 produtos na API | [Catálogo: mostrando 20 de 60](capturas/01-catalogo-60-produtos.png). A resposta das três páginas com 60 ids distintos está em [evidencia-paginacao.json](evidencia-paginacao.json). |
| 2. CRUD completo pelo app | [Cadastro confirmado e total 61](capturas/03-produto-cadastrado-na-api.png), [produto cadastrado](capturas/04-detalhe-produto-cadastrado.png), [edição persistida após recarregar](capturas/05-produto-editado-persistido.png), [confirmação de exclusão](capturas/06-confirmacao-exclusao.png) e [exclusão concluída](capturas/07-produto-excluido-na-api.png). |
| 3. Tratamento de erros | [Dados inválidos](capturas/08-erro-dados-invalidos.png), [produto inexistente — 404 real](capturas/09-erro-produto-inexistente.png), [API realmente desligada](capturas/13-api-desligada.png), [conexão indisponível](capturas/10-erro-conexao-indisponivel.png), [recuperação da conexão](capturas/11-conexao-recuperada.png) e [falha na próxima página sem perder a lista](capturas/12-erro-paginacao-preserva-lista.png). |
| 4. Scroll infinito | [Fim da lista: 60 de 60, página 3 de 3](capturas/02-scroll-infinito-3-paginas.png). O teste registra as chamadas das páginas 0, 1 e 2 sem clicar em um botão para carregar. |

A captura 10 é produzida com o navegador em modo offline. A captura 12 simula uma conexão recusada somente na próxima página. A captura 13 foi obtida interrompendo o processo Java da API. Os demais testes usam as respostas reais da API, incluindo POST, PUT, DELETE e 404. O produto temporário de demonstração é removido ao final, mantendo os 60 produtos iniciais.

A persistência em disco também foi conferida criando um produto, encerrando a API e consultando o mesmo id após reiniciá-la. Os dados antes/depois e a exclusão de limpeza estão em [evidencia-persistencia.json](evidencia-persistencia.json).

## Roteiro para apresentar ao professor

1. Execute `npm run api` e, em outro terminal, `npm run web -- --port 8081`. Abra http://localhost:8081 e deixe a busca vazia. A primeira página deve mostrar **20 de 60 produtos**.
2. Role a lista. O app busca a segunda e a terceira página automaticamente, chegando a **60 de 60 produtos carregados**. A mensagem de fim aparece depois da última página.
3. Toque em **Cadastrar produto**, preencha os campos obrigatórios e salve. Confira a confirmação e procure o nome cadastrado.
4. Abra o produto, toque em **Editar produto**, altere preço/estoque e salve. Recarregue o app e confira os valores. Eles foram gravados na API.
5. Toque em **Excluir produto**. Primeiro cancele para demonstrar a confirmação. Depois confirme e confira que o produto sumiu da busca.
6. Tente salvar um formulário vazio ou com preço negativo. A mensagem explica o que corrigir e os campos continuam utilizáveis.
7. Abra http://localhost:8081/produtos/00000000-0000-0000-0000-000000000000 para demonstrar um produto inexistente. Use **Voltar à lista** para recuperar a navegação.
8. Pare a API pelo terminal e clique em **Atualizar** no app. Confira a mensagem de conexão. Reinicie a API e toque em **Tentar novamente**. O catálogo deve voltar.

## Testes

- **API:** carga inicial idempotente de 60 produtos, páginas sem repetição, tamanho máximo, CRUD completo, validação em POST/PUT, JSON e identificador inválidos, 404 e filtro por categoria.
- **App:** listagem/scroll com três chamadas, CRUD com leitura direta da API e recarregamento, confirmação/cancelamento de exclusão, formulário inválido, 404 com recuperação, conexão indisponível com recuperação, falha de paginação preservando itens, busca alterada durante uma requisição e layout de 320 px.
- **Build:** TypeScript e exportação web do Expo.

Os resultados desta execução estão em [validacao.md](validacao.md). Para repetir a captura automática: `npm run test:e2e`. Consulte os requisitos e comandos em [`../README.md`](../README.md).

## Enviar o commit para o GitHub

O endereço de entrega é o repositório acima, com o commit desta atividade publicado. Para obter a revisão local:

```powershell
git log -1 --oneline
```

Se o envio acusar `403`, entre no GitHub com uma conta que tenha permissão em `Caio1137/loja-compre-bem` e execute, na pasta do projeto:

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
git push origin main
```

Depois de publicar, o link do commit tem o formato `https://github.com/Caio1137/loja-compre-bem/commit/SEU_HASH`. Não é necessário publicar a API separadamente, pois seu código acompanha esta entrega em `api/`.
