import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProdutoItem from '../components/ProdutoItem';
import {
  carregarFavoritos,
  carregarUltimaBusca,
  salvarFavoritos,
  salvarUltimaBusca,
} from '../services/preferenciasStorage';
import { buscarProdutos } from '../services/produtosService';
import { styles } from '../styles/styles';
import type { RootStackParamList } from '../types/navigation';
import type { Page } from '../types/page';
import type { Produto } from '../types/produto';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProdutos'>;
type InfoPagina = Page<Produto>['page'];

const ESPERA_BUSCA_MS = 400;

export default function ListaProdutosScreen({ navigation }: Props) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [infoPagina, setInfoPagina] = useState<InfoPagina | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    async function carregarDadosSalvos() {
      try {
        setFavoritos(await carregarFavoritos());
        setBusca(await carregarUltimaBusca());
      } catch {
        setFavoritos([]);
      }
    }

    carregarDadosSalvos();
  }, []);

  // Busca a primeira página na API sempre que a tela ganha foco ou a busca muda.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setCarregando(true);
      setErroApi('');

      const temporizador = setTimeout(async () => {
        try {
          const resposta = await buscarProdutos(busca);

          if (ativo) {
            setProdutos(resposta.content);
            setInfoPagina(resposta.page);
          }
        } catch {
          if (ativo) {
            setProdutos([]);
            setInfoPagina(null);
            setErroApi('Não foi possível carregar os produtos. Verifique se a API está ligada.');
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }, ESPERA_BUSCA_MS);

      return () => {
        ativo = false;
        clearTimeout(temporizador);
      };
    }, [busca, tentativa]),
  );

  async function carregarMaisProdutos() {
    if (!infoPagina || carregandoMais) {
      return;
    }

    setCarregandoMais(true);

    try {
      const resposta = await buscarProdutos(busca, infoPagina.number + 1);
      setProdutos((atuais) => [...atuais, ...resposta.content]);
      setInfoPagina(resposta.page);
    } catch {
      setErroApi('Não foi possível carregar mais produtos.');
    } finally {
      setCarregandoMais(false);
    }
  }

  function alternarFavorito(produtoId: string) {
    setFavoritos((atual) => {
      const novosFavoritos = atual.includes(produtoId)
        ? atual.filter((favoritoId) => favoritoId !== produtoId)
        : [...atual, produtoId];

      salvarFavoritos(novosFavoritos);
      return novosFavoritos;
    });
  }

  function atualizarBusca(texto: string) {
    setBusca(texto);
    salvarUltimaBusca(texto);
  }

  const temMaisPaginas = infoPagina !== null && infoPagina.number + 1 < infoPagina.totalPages;

  function renderizarEstadoVazio() {
    if (carregando) {
      return <ActivityIndicator style={styles.carregando} size="large" color="#1B3A5C" />;
    }

    if (erroApi !== '') {
      return (
        <>
          <Text style={styles.erroLista}>{erroApi}</Text>
          <TouchableOpacity
            style={styles.botaoCarregarMais}
            onPress={() => setTentativa((atual) => atual + 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotaoCarregarMais}>Tentar novamente</Text>
          </TouchableOpacity>
        </>
      );
    }

    return <Text style={styles.listaVazia}>Nenhum produto encontrado.</Text>;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listaConteudo}
      data={produtos}
      keyExtractor={(produto) => produto.produtoId}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <ProdutoItem
          produto={item}
          favorito={favoritos.includes(item.produtoId)}
          onAlternarFavorito={() => alternarFavorito(item.produtoId)}
          onPress={() => navigation.navigate('DetalheProduto', { produtoId: item.produtoId })}
        />
      )}
      ListEmptyComponent={renderizarEstadoVazio}
      ListHeaderComponent={
        <>
          <StatusBar style="auto" />
          <Text style={styles.titulo}>Loja Compre Bem</Text>
          <Text style={styles.subtitulo}>Produtos para deixar seu espaço de trabalho mais prático.</Text>

          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar por produto ou categoria"
            value={busca}
            onChangeText={atualizarBusca}
          />

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => navigation.navigate('CadastroProduto')}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotaoPrincipal}>Cadastrar produto</Text>
          </TouchableOpacity>

          <Text style={styles.tituloSecao}>Produtos disponíveis</Text>
          {!carregando && infoPagina && infoPagina.totalElements > 0 && (
            <Text style={styles.resumoLista}>
              Mostrando {produtos.length} de {infoPagina.totalElements} produtos
            </Text>
          )}
        </>
      }
      ListFooterComponent={
        !carregando && temMaisPaginas ? (
          <TouchableOpacity
            style={styles.botaoCarregarMais}
            onPress={carregarMaisProdutos}
            activeOpacity={0.8}
          >
            {carregandoMais
              ? <ActivityIndicator color="#1B3A5C" />
              : <Text style={styles.textoBotaoCarregarMais}>Carregar mais</Text>}
          </TouchableOpacity>
        ) : null
      }
    />
  );
}
