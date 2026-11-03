import { getJson, postJson } from './api';
import type { Page } from '../types/page';
import type { NovoProduto, Produto } from '../types/produto';

const TAMANHO_PAGINA = 20;

export function buscarProdutos(filtro: string, pagina = 0): Promise<Page<Produto>> {
  const parametros = `filtro=${encodeURIComponent(filtro.trim())}&page=${pagina}&size=${TAMANHO_PAGINA}`;
  return getJson<Page<Produto>>(`/produtos/filtro?${parametros}`);
}

export function buscarProdutoPorId(produtoId: string): Promise<Produto> {
  return getJson<Produto>(`/produtos/${produtoId}`);
}

export function cadastrarProduto(produto: NovoProduto): Promise<Produto> {
  return postJson<Produto>('/produtos', produto);
}
