import { deleteJson, getJson, postJson, putJson } from './api';
import type { Page } from '../types/page';
import type { NovoProduto, Produto } from '../types/produto';

const TAMANHO_PAGINA = 20;

export function buscarProdutos(filtro: string, pagina = 0, signal?: AbortSignal): Promise<Page<Produto>> {
  const parametros = `filtro=${encodeURIComponent(filtro.trim())}&page=${pagina}&size=${TAMANHO_PAGINA}&sort=nome,asc&sort=id,asc`;
  return getJson<Page<Produto>>(`/produtos/filtro?${parametros}`, signal);
}

export function buscarProdutoPorId(produtoId: string, signal?: AbortSignal): Promise<Produto> {
  return getJson<Produto>(`/produtos/${encodeURIComponent(produtoId)}`, signal);
}

export function editarProduto(produtoId: string, produto: NovoProduto): Promise<Produto> {
  return putJson<Produto>(`/produtos/${encodeURIComponent(produtoId)}`, produto);
}

export function excluirProduto(produtoId: string): Promise<void> {
  return deleteJson(`/produtos/${encodeURIComponent(produtoId)}`);
}

export function cadastrarProduto(produto: NovoProduto): Promise<Produto> {
  return postJson<Produto>('/produtos', produto);
}
