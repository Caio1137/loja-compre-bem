import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../services/api';
import { buscarProdutoPorId } from '../services/produtosService';
import { styles } from '../styles/styles';
import { formatarPreco } from '../utils/formatarPreco';
import type { RootStackParamList } from '../types/navigation';
import type { Produto } from '../types/produto';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheProduto'>;

export default function DetalheProdutoScreen({ route }: Props) {
  const { produtoId } = route.params;
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');

    buscarProdutoPorId(produtoId)
      .then((resposta) => {
        if (ativo) {
          setProduto(resposta);
        }
      })
      .catch((error: unknown) => {
        if (ativo) {
          setProduto(null);
          setErro(
            error instanceof ApiError && error.status === 404
              ? 'Produto não encontrado.'
              : 'Não foi possível carregar o produto. Verifique se a API está ligada.',
          );
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [produtoId]);

  if (carregando) {
    return (
      <View style={styles.containerDetalhe}>
        <ActivityIndicator style={styles.carregando} size="large" color="#1B3A5C" />
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.containerDetalhe}>
        <Text style={styles.erroLista}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerDetalhe}>
      <StatusBar style="auto" />
      <Image source={{ uri: produto.imagem }} style={styles.imagemDetalhe} />
      <Text style={styles.nomeDetalhe}>{produto.nome}</Text>
      <Text style={styles.precoDetalhe}>{formatarPreco(produto.preco)}</Text>
      <Text style={styles.categoriaDetalhe}>Categoria: {produto.categoria}</Text>
      <Text style={styles.estoqueDetalhe}>Em estoque: {produto.quantidade}</Text>
      <Text style={styles.descricaoDetalhe}>{produto.descricao}</Text>
    </View>
  );
}
