// No navegador, localhost funciona. No celular com Expo Go, troque localhost
// pelo IP do computador na rede (ex.: http://192.168.0.10:8080/api/v1).
const API_URL = 'http://localhost:8080/api/v1';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function lerResposta<T>(resposta: Response, caminho: string): Promise<T> {
  if (!resposta.ok) {
    throw new ApiError(resposta.status, `A API respondeu ${resposta.status} para ${caminho}.`);
  }

  return (await resposta.json()) as T;
}

export async function getJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`);
  return lerResposta<T>(resposta, caminho);
}

export async function postJson<T>(caminho: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  return lerResposta<T>(resposta, caminho);
}
