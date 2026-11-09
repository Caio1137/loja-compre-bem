import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { mensagemErro } from '../services/api';
import { buscarProdutos } from '../services/produtosService';
import type { Page } from '../types/page';
import type { Produto } from '../types/produto';

export function useProdutosPaginados(busca: string, pronto: boolean) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pagina, setPagina] = useState<Page<Produto>['page'] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState('');
  const [erroMais, setErroMais] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const geracao = useRef(0);
  const ocupado = useRef(false);
  const ultimaPaginaCarregada = useRef(-1);
  const falhaNaProximaPagina = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useFocusEffect(useCallback(() => {
    const atual = ++geracao.current;
    const abort = new AbortController();
    controller.current = abort;
    ocupado.current = true;
    ultimaPaginaCarregada.current = -1;
    falhaNaProximaPagina.current = false;
    setCarregando(true);
    setCarregandoMais(false);
    setProdutos([]);
    setPagina(null);
    setErro('');
    setErroMais('');

    const timer = setTimeout(async () => {
      if (!pronto) return;
      try {
        const resposta = await buscarProdutos(busca, 0, abort.signal);
        if (geracao.current !== atual) return;
        ultimaPaginaCarregada.current = resposta.page.number;
        setProdutos(resposta.content);
        setPagina(resposta.page);
      } catch (falha) {
        if (geracao.current === atual) setErro(mensagemErro(falha));
      } finally {
        if (geracao.current === atual) {
          ocupado.current = false;
          setCarregando(false);
        }
      }
    }, 350);

    return () => {
      ++geracao.current;
      abort.abort();
      clearTimeout(timer);
    };
  }, [busca, pronto, tentativa]));

  const temMais = pagina !== null && pagina.number + 1 < pagina.totalPages;

  async function carregarMais(repetir = false) {
    if (!temMais || !pagina || ocupado.current || (falhaNaProximaPagina.current && !repetir)) return;
    const proximaPagina = pagina.number + 1;
    // Um callback antigo pode disparar entre a resposta e o próximo render.
    if (proximaPagina <= ultimaPaginaCarregada.current) return;
    // A trava é síncrona: onEndReached pode disparar novamente antes do render.
    ocupado.current = true;
    falhaNaProximaPagina.current = false;
    const atual = geracao.current;
    setCarregandoMais(true);
    setErroMais('');
    try {
      const resposta = await buscarProdutos(busca, proximaPagina, controller.current?.signal);
      if (geracao.current !== atual) return;
      ultimaPaginaCarregada.current = resposta.page.number;
      setProdutos((anteriores) => [...new Map(
        [...anteriores, ...resposta.content].map((produto) => [produto.produtoId, produto]),
      ).values()]);
      setPagina(resposta.page);
    } catch (falha) {
      if (geracao.current === atual) {
        falhaNaProximaPagina.current = true;
        setErroMais(mensagemErro(falha));
      }
    } finally {
      if (geracao.current === atual) {
        ocupado.current = false;
        setCarregandoMais(false);
      }
    }
  }

  return {
    produtos, pagina, carregando, carregandoMais, erro, erroMais, temMais, carregarMais,
    atualizar: () => setTentativa((valor) => valor + 1),
  };
}
