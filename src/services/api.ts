// No Expo Go, configure o IP do computador no arquivo .env.local.
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function mensagemErro(erro: unknown): string {
  return erro instanceof ApiError
    ? erro.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

async function requisicao<T>(caminho: string, metodo: string, corpo?: unknown, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const cancelar = () => controller.abort();
  signal?.addEventListener('abort', cancelar);
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(cancelar, 10000);

  try {
    const resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      signal: controller.signal,
      headers: corpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });

    if (!resposta.ok) {
      const dados = await resposta.json().catch(() => null);
      const mensagem = resposta.status === 404
        ? 'Produto não encontrado. Ele pode ter sido excluído. Volte à lista e atualize os produtos.'
        : resposta.status >= 500
          ? 'A loja está temporariamente indisponível. Tente novamente em instantes.'
          : dados?.mensagem ?? 'Confira os dados informados e tente novamente.';
      throw new ApiError(resposta.status, mensagem);
    }

    // DELETE devolve 204 sem corpo; não devemos tentar ler JSON nesse caso.
    if (resposta.status === 204) return undefined as T;
    return await resposta.json() as T;
  } catch (erro) {
    if (signal?.aborted) throw erro;
    if (erro instanceof ApiError) throw erro;
    throw new ApiError(0, 'Não foi possível conectar à loja. Verifique sua conexão e se a API está ligada. Depois, tente novamente.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelar);
  }
}

export const getJson = <T>(caminho: string, signal?: AbortSignal) => requisicao<T>(caminho, 'GET', undefined, signal);
export const postJson = <T>(caminho: string, corpo: unknown) => requisicao<T>(caminho, 'POST', corpo);
export const putJson = <T>(caminho: string, corpo: unknown) => requisicao<T>(caminho, 'PUT', corpo);
export const deleteJson = (caminho: string) => requisicao<void>(caminho, 'DELETE');
