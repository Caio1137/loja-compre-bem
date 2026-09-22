# Exercício da Aula 16: Persistência de um Segundo Dado na Loja

**Nome:** Caio Marques  
**Data:** 22/09/2026

## Dado escolhido

Escolhi guardar o texto da última busca digitada no catálogo. Faz sentido manter esse texto porque, ao voltar para a Loja depois de fechar o app, a pessoa continua vendo a mesma pesquisa que estava fazendo.

## Chave usada

Usei a chave `@compre_bem:ultima_busca`. Ela é diferente da chave `@compre_bem:favoritos`, usada para os favoritos.

## Implementação

O texto é salvo sempre que muda no campo de busca. Quando a tela de produtos abre, o app lê o valor salvo e coloca o texto de volta no campo.

```jsx
const CHAVE_ULTIMA_BUSCA = '@compre_bem:ultima_busca';

useEffect(() => {
  async function carregarDadosSalvos() {
    const buscaSalva = await AsyncStorage.getItem(CHAVE_ULTIMA_BUSCA);

    if (buscaSalva) {
      setBusca(buscaSalva);
    }
  }

  carregarDadosSalvos();
}, []);

function atualizarBusca(texto) {
  setBusca(texto);
  AsyncStorage.setItem(CHAVE_ULTIMA_BUSCA, texto);
}
```

Os favoritos também foram ajustados para usar `@compre_bem:favoritos`, com os ids dos produtos salvos em JSON.

## Teste

O build web foi compilado sem erros. Antes da entrega, ainda preciso fazer o teste no Expo Go: digitar uma busca, fechar o app pela tela de aplicativos recentes, abrir novamente e conferir se o texto continua no campo.
