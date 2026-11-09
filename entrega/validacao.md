# Verificação da atividade

Verificação realizada em 09/11/2026, com Node.js 22.23.1, JDK 21, Expo SDK 57, Spring Boot 4.1.1 e Chrome.

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado, sem erros de TypeScript. |
| `npm run build:web` | Aprovado; exportação web em `dist/` (gerada localmente, não versionada). |
| `cd api; .\mvnw.cmd --batch-mode --no-transfer-progress test` | 7 testes aprovados; zero falhas, erros ou testes ignorados. |
| `npm run test:e2e` | 8 testes aprovados no Chrome; viewport principal de 430 × 932 e verificação adicional em 320 × 568. |
| Reinício da API com banco em arquivo | Produto criado antes do encerramento permaneceu disponível com os mesmos dados após reiniciar. Produto de teste removido ao final. |
| API realmente desligada | App mostrou mensagem de conexão e botão para tentar novamente; captura 13. |
| Catálogo ao final | 60 produtos na API. |

Os testes do app confirmam POST 201, dados editados por GET após PUT, persistência após recarregar a página e GET 404 após DELETE 204. A paginação solicita somente as páginas 0, 1 e 2, totalizando 60 ids distintos. A alteração de busca durante uma página pendente não mistura os resultados.

As evidências são [as capturas](capturas), [as respostas paginadas](evidencia-paginacao.json) e [o teste de persistência](evidencia-persistencia.json). Não foi executado emulador nem dispositivo Android/iOS nesta verificação; as capturas são da versão web do mesmo app React Native.
