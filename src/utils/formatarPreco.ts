export function formatarPreco(preco: number): string {
  return `R$ ${preco.toFixed(2).replace('.', ',')}`;
}
