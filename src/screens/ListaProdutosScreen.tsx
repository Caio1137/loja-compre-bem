import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProdutoItem from '../components/ProdutoItem';
import { useProdutosPaginados } from '../hooks/useProdutosPaginados';
import { carregarFavoritos, carregarUltimaBusca, salvarFavoritos, salvarUltimaBusca } from '../services/preferenciasStorage';
import { styles } from '../styles/styles';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ListaProdutos'>;

export default function ListaProdutosScreen({ navigation, route }: Props) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [pronto, setPronto] = useState(false);
  const [aviso, setAviso] = useState('');
  const lista = useProdutosPaginados(busca, pronto);

  useEffect(() => {
    let ativo = true;
    Promise.all([carregarFavoritos(), carregarUltimaBusca()])
      .then(([salvos, ultimaBusca]) => {
        if (ativo) { setFavoritos(salvos); setBusca(ultimaBusca); }
      })
      .catch(() => { if (ativo) setAviso('Não foi possível recuperar suas preferências salvas.'); })
      .finally(() => { if (ativo) setPronto(true); });
    return () => { ativo = false; };
  }, []);

  function alternarFavorito(produtoId: string) {
    const novos = favoritos.includes(produtoId)
      ? favoritos.filter((id) => id !== produtoId) : [...favoritos, produtoId];
    setFavoritos(novos);
    salvarFavoritos(novos).catch(() => setAviso('Não foi possível salvar os favoritos neste aparelho.'));
  }

  function atualizarBusca(texto: string) {
    setBusca(texto);
    salvarUltimaBusca(texto).catch(() => setAviso('Não foi possível guardar a última busca neste aparelho.'));
  }

  return (
    <FlatList
      testID="lista-produtos"
      style={styles.container}
      contentContainerStyle={styles.listaConteudo}
      data={lista.produtos}
      keyExtractor={(produto) => produto.produtoId}
      keyboardShouldPersistTaps="handled"
      onEndReached={() => { void lista.carregarMais(); }}
      onEndReachedThreshold={0.35}
      refreshing={lista.carregando}
      onRefresh={lista.atualizar}
      renderItem={({ item }) => (
        <ProdutoItem produto={item} favorito={favoritos.includes(item.produtoId)}
          onAlternarFavorito={() => alternarFavorito(item.produtoId)}
          onPress={() => navigation.navigate('DetalheProduto', { produtoId: item.produtoId })} />
      )}
      ListHeaderComponent={
        <>
          <StatusBar style="dark" />
          <Text style={styles.titulo}>Loja Compre Bem</Text>
          <Text style={styles.subtitulo}>Produtos para deixar seu espaço de trabalho mais prático.</Text>
          {route.params?.mensagem && <Text accessibilityRole="alert" style={styles.sucesso}>{route.params.mensagem}</Text>}
          {aviso !== '' && <Text accessibilityRole="alert" style={styles.erro}>{aviso}</Text>}
          <TextInput style={styles.inputBusca} accessibilityLabel="Buscar produtos"
            placeholder="Buscar por produto ou categoria" value={busca} onChangeText={atualizarBusca} />
          <TouchableOpacity accessibilityRole="button" style={styles.botaoPrincipal}
            onPress={() => navigation.navigate('CadastroProduto')} activeOpacity={0.8}>
            <Text style={styles.textoBotaoPrincipal}>Cadastrar produto</Text>
          </TouchableOpacity>
          <View style={styles.cabecalhoSecao}>
            <Text style={styles.tituloSecao}>Produtos disponíveis</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar produtos" onPress={lista.atualizar}>
              <Text style={styles.link}>Atualizar</Text>
            </TouchableOpacity>
          </View>
          {!lista.carregando && lista.pagina && (
            <Text testID="resumo-produtos" style={styles.resumoLista}>
              Mostrando {lista.produtos.length} de {lista.pagina.totalElements} produtos
            </Text>
          )}
        </>
      }
      ListEmptyComponent={lista.carregando ? <ActivityIndicator style={styles.carregando} size="large" color="#1B3A5C" />
        : lista.erro ? <View>
          <Text accessibilityRole="alert" style={styles.erroLista}>{lista.erro}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.botaoCarregarMais} onPress={lista.atualizar}>
            <Text style={styles.textoBotaoCarregarMais}>Tentar novamente</Text>
          </TouchableOpacity>
        </View> : <Text style={styles.listaVazia}>Nenhum produto encontrado. Tente outra busca.</Text>}
      ListFooterComponent={!lista.carregando && lista.produtos.length > 0 ? <View style={styles.rodapeLista}>
        <Text testID="paginacao" style={styles.resumoLista}>
          {lista.produtos.length} de {lista.pagina?.totalElements} produtos carregados · Página {(lista.pagina?.number ?? 0) + 1} de {lista.pagina?.totalPages}
        </Text>
        {lista.carregandoMais && <ActivityIndicator accessibilityLabel="Carregando mais produtos" color="#1B3A5C" />}
        {lista.erroMais ? <>
          <Text accessibilityRole="alert" style={styles.erroLista}>{lista.erroMais}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.botaoCarregarMais} onPress={() => { void lista.carregarMais(true); }}>
            <Text style={styles.textoBotaoCarregarMais}>Tentar carregar mais</Text>
          </TouchableOpacity>
        </> : <Text style={styles.resumoLista}>{lista.temMais ? 'Role para carregar mais produtos.' : 'Você chegou ao fim da lista.'}</Text>}
      </View> : null}
    />
  );
}
