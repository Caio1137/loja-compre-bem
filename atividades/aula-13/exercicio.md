# Exercício da Aula 13: Layouts Responsivos com Flexbox

**Nome:** Caio Marques    **Data:** 14/09/2026

## Elemento escolhido

Escolhi a linha de ações do componente `ProdutoItem`: os botões de diminuir e aumentar quantidade, o texto da quantidade e o botão de salvar.

Antes da correção, todos os itens eram mantidos em uma única linha. Em telas estreitas, o espaço da área de informações do card ficava reduzido pela imagem do produto e os controles podiam ficar apertados. Além disso, os botões de `-` e `+` tinham somente 25 por 25 pixels, o que deixava o toque pouco confortável no celular.

## Correção aplicada

Usei `flexWrap: 'wrap'` na `linhaAcoes`. Assim, quando os controles não cabem na largura disponível, eles passam para a linha seguinte em vez de estourar o card. Também acrescentei `width: '100%'` e `minWidth: 0` no card, além de `minWidth: 0` no bloco de informações. Essas propriedades limitam o card à largura da tela e permitem que a quebra de linha seja aplicada. Defini 44 por 44 pixels nos botões de quantidade e `minHeight: 44` no botão de salvar, para manter uma área de toque adequada.

## Teste em duas resoluções

- **320 x 568:** os botões de quantidade permanecem legíveis e o botão de salvar vai para a linha de baixo, sem cortar o conteúdo do card.
- **768 x 1024:** todos os controles ficam na mesma linha, com espaçamento entre eles e sem ocupar uma largura desnecessária.

Nos dois casos, os controles continuam visíveis e fáceis de tocar.

## Código da correção

```jsx
linhaAcoes: {
  alignItems: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 12,
},
card: {
  flexDirection: 'row',
  minWidth: 0,
  width: '100%',
},
informacoesCard: {
  flex: 1,
  minWidth: 0,
},
botaoPequeno: {
  alignItems: 'center',
  backgroundColor: '#E8EDF2',
  borderRadius: 4,
  height: 44,
  justifyContent: 'center',
  width: 44,
},
botaoFavorito: {
  alignItems: 'center',
  backgroundColor: '#E8EDF2',
  borderRadius: 4,
  justifyContent: 'center',
  minHeight: 44,
  paddingHorizontal: 10,
},
```
