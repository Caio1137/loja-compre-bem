import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const API = 'http://localhost:8080/api/v1/produtos';
const pasta = 'entrega/capturas';

async function capturar(page: Page, nome: string) {
  await mkdir(pasta, { recursive: true });
  await page.screenshot({ path: `${pasta}/${nome}.png`, animations: 'disabled' });
}

async function rolarAteFim(page: Page) {
  // Aguarda o layout da FlatList virtualizada antes de rolar à nova posição.
  await page.getByTestId('paginacao').scrollIntoViewIfNeeded();
}

test('60 produtos e scroll infinito buscam somente as três páginas necessárias', async ({ page, request }) => {
  const erros: string[] = [];
  page.on('pageerror', (erro) => erros.push(erro.message));
  const paginas: number[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/produtos/filtro?')) paginas.push(Number(new URL(req.url()).searchParams.get('page')));
  });
  await page.goto('/');
  await expect(page.getByTestId('resumo-produtos')).toHaveText('Mostrando 20 de 60 produtos');
  await capturar(page, '01-lista');
  await rolarAteFim(page);
  await expect(page.getByTestId('paginacao')).toContainText('40 de 60 produtos carregados');
  await rolarAteFim(page);
  await expect(page.getByTestId('paginacao')).toContainText('60 de 60 produtos carregados');
  await rolarAteFim(page);
  await expect(page.getByText('Você chegou ao fim da lista.')).toBeVisible();
  await capturar(page, '08-scroll-infinito');
  expect(paginas).toEqual([0, 1, 2]);
  expect(erros).toEqual([]);
  const respostas = await Promise.all([0, 1, 2].map(async (pagina) => {
    const resposta = await request.get(`${API}/filtro?page=${pagina}&size=20&sort=nome,asc&sort=id,asc`);
    expect(resposta.ok()).toBeTruthy();
    return resposta.json();
  }));
  const ids = respostas.flatMap((resposta) => resposta.content.map((produto: { produtoId: string }) => produto.produtoId));
  expect(new Set(ids).size).toBe(60);
});

test('cadastrar, consultar, editar e excluir pelo app grava na API', async ({ page, request }) => {
  let id = '';
  await page.goto('/');
  await expect(page.getByTestId('resumo-produtos')).toBeVisible();
  await page.getByRole('button', { name: 'Cadastrar produto', exact: true }).click();
  await page.getByLabel('Nome do produto', { exact: true }).fill('Caderno capa dura');
  await page.getByLabel('Preço', { exact: true }).fill('29,90');
  await page.getByLabel('Categoria', { exact: true }).fill('Papelaria');
  await page.getByLabel('Quantidade em estoque', { exact: true }).fill('7');
  await page.getByLabel('Descrição', { exact: true }).fill('Caderno espiral com 200 folhas pautadas e capa dura.');
  try {
    const criada = page.waitForResponse((resposta) => resposta.url() === API && resposta.request().method() === 'POST');
    await page.getByRole('button', { name: 'Salvar produto', exact: true }).click();
    const resposta = await criada;
    expect(resposta.status()).toBe(201);
    id = (await resposta.json()).produtoId;
    await expect(page.getByText('Produto cadastrado com sucesso.')).toBeVisible();
    await expect(page.getByTestId('resumo-produtos')).toHaveText('Mostrando 20 de 61 produtos');
    await page.getByLabel('Buscar produtos').fill('Caderno capa dura');
    await expect(page.getByTestId('resumo-produtos')).toHaveText('Mostrando 1 de 1 produtos');
    await capturar(page, '02-cadastro');
    await page.getByRole('button', { name: 'Ver Caderno capa dura', exact: true }).click();
    await expect(page.getByText('Em estoque: 7')).toBeVisible();
    await page.getByRole('button', { name: 'Editar produto', exact: true }).click();
    await expect(page.getByLabel('Nome do produto', { exact: true })).toHaveValue('Caderno capa dura');
    await page.getByLabel('Nome do produto', { exact: true }).fill('Caderno capa dura 200 folhas');
    await page.getByLabel('Preço', { exact: true }).fill('34,90');
    await page.getByLabel('Quantidade em estoque', { exact: true }).fill('12');
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(page.getByText('Produto atualizado com sucesso.')).toBeVisible();
    const atualizado = await (await request.get(`${API}/${id}`)).json();
    expect(atualizado).toMatchObject({ nome: 'Caderno capa dura 200 folhas', preco: 34.9, quantidade: 12 });
    await page.reload();
    await page.getByRole('button', { name: 'Ver Caderno capa dura 200 folhas', exact: true }).click();
    await expect(page.getByText('Em estoque: 12')).toBeVisible();
    await capturar(page, '03-edicao');
    await page.getByRole('button', { name: 'Excluir produto', exact: true }).click();
    await expect(page.getByText('Excluir produto?', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    expect((await request.get(`${API}/${id}`)).status()).toBe(200);
    await page.getByRole('button', { name: 'Excluir produto', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
    await expect(page.getByText('Produto excluído com sucesso.')).toBeVisible();
    await expect(page.getByText('Nenhum produto encontrado. Tente outra busca.')).toBeVisible();
    expect((await request.get(`${API}/${id}`)).status()).toBe(404);
    await capturar(page, '04-exclusao');
  } finally {
    if (id) await request.delete(`${API}/${id}`);
  }
});

test('dados inválidos mostram mensagem e mantêm formulário utilizável', async ({ page }) => {
  await page.goto('/cadastro');
  await page.getByRole('button', { name: 'Salvar produto', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Informe um nome com 2 a 100 caracteres.');
  await capturar(page, '05-dados-invalidos');
  await page.getByLabel('Nome do produto', { exact: true }).fill('Teste de validação');
  await page.getByLabel('Preço', { exact: true }).fill('-10');
  await page.getByRole('button', { name: 'Salvar produto', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Informe um preço maior que zero');
  await expect(page.getByLabel('Nome do produto', { exact: true })).toHaveValue('Teste de validação');
});

test('produto inexistente mostra erro 404 e oferece recuperação', async ({ page }) => {
  await page.goto('/produtos/00000000-0000-0000-0000-000000000000');
  await expect(page.getByRole('alert')).toContainText('Produto não encontrado.');
  await capturar(page, '06-produto-inexistente');
  await page.getByRole('button', { name: 'Voltar à lista', exact: true }).click();
  await expect(page.getByTestId('resumo-produtos')).toBeVisible();
});

test('conexão indisponível mostra mensagem e tentar novamente recupera a lista', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByTestId('resumo-produtos')).toBeVisible();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Atualizar produtos' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível conectar à loja.');
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByTestId('resumo-produtos')).toHaveText('Mostrando 20 de 60 produtos');
});

test('falha na próxima página preserva produtos e permite repetir a mesma página', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('resumo-produtos')).toBeVisible();
  await page.route('**/produtos/filtro?**', async (rota) => {
    if (new URL(rota.request().url()).searchParams.get('page') === '1') await rota.abort('connectionrefused');
    else await rota.continue();
  });
  await rolarAteFim(page);
  await expect(page.getByRole('button', { name: 'Tentar carregar mais' })).toBeVisible();
  await expect(page.getByTestId('paginacao')).toContainText('20 de 60 produtos carregados');
  await page.unroute('**/produtos/filtro?**');
  await page.getByRole('button', { name: 'Tentar carregar mais' }).click();
  await expect(page.getByTestId('paginacao')).toContainText('40 de 60 produtos carregados');
});

test('resposta atrasada da paginação não mistura resultados de outra busca', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('resumo-produtos')).toBeVisible();
  let liberar!: () => void;
  const pendente = new Promise<void>((resolve) => { liberar = resolve; });
  await page.route('**/produtos/filtro?**', async (rota) => {
    if (new URL(rota.request().url()).searchParams.get('page') === '1') {
      await pendente;
      await rota.continue().catch(() => {});
    } else await rota.continue();
  });
  await rolarAteFim(page);
  await expect(page.getByLabel('Carregando mais produtos')).toBeVisible();
  await page.getByTestId('lista-produtos').evaluate((elemento) => { elemento.scrollTop = 0; });
  await page.getByLabel('Buscar produtos').fill('Papelaria');
  await expect(page.getByTestId('resumo-produtos')).toHaveText('Mostrando 10 de 10 produtos');
  liberar();
  await expect(page.getByTestId('resumo-produtos')).toHaveText('Mostrando 10 de 10 produtos');
  await expect(page.getByText('Categoria: Móveis', { exact: true })).toHaveCount(0);
});

test('formulário e catálogo cabem em tela estreita', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.getByTestId('resumo-produtos')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'Cadastrar produto', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar produto', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Salvar produto', exact: true })).toBeVisible();
});
