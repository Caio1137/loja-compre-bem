# Loja Compre Bem

App em React Native com Expo e API em Spring Boot. Os produtos ficam salvos no banco H2.

## Executar

Requisitos: Node.js 22 e Java 21.

```powershell
npm ci
npm run api
```

Em outro terminal:

```powershell
npm run web -- --port 8081
```

App: http://localhost:8081. API: http://localhost:8080/api/v1/produtos.

Para usar no celular, copie `.env.example` para `.env.local`, troque `localhost` pelo IP do computador e execute `npm start`.

## Capturas da atividade

| Requisito | Capturas |
| --- | --- |
| 60 produtos cadastrados na API | [Lista com 60 produtos](entrega/capturas/01-lista.png) |
| CRUD completo pelo app | [Cadastro](entrega/capturas/02-cadastro.png), [edição](entrega/capturas/03-edicao.png) e [exclusão](entrega/capturas/04-exclusao.png) |
| Tratamento de erros | [Dados inválidos](entrega/capturas/05-dados-invalidos.png), [produto inexistente](entrega/capturas/06-produto-inexistente.png) e [API desligada](entrega/capturas/07-api-desligada.png) |
| Scroll infinito | [60 produtos carregados em três páginas](entrega/capturas/08-scroll-infinito.png) |

As capturas são da versão web do app. A lista carrega 20 produtos por vez, conforme a rolagem.

## Testes

```powershell
npm run typecheck
npm run test:e2e
cd api
.\mvnw.cmd test
```
