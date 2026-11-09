import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mensagemErro } from '../services/api';
import { buscarProdutoPorId, excluirProduto } from '../services/produtosService';
import { styles } from '../styles/styles';
import { formatarPreco } from '../utils/formatarPreco';
import type { RootStackParamList } from '../types/navigation';
import type { Produto } from '../types/produto';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheProduto'>;

export default function DetalheProdutoScreen({ route, navigation }: Props) {
  const { produtoId } = route.params;
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const ocupado = useRef(false);

  useFocusEffect(useCallback(() => {
    const abort = new AbortController();
    setCarregando(true); setErro('');
    buscarProdutoPorId(produtoId, abort.signal)
      .then((resposta) => { if (!abort.signal.aborted) setProduto(resposta); })
      .catch((falha) => { if (!abort.signal.aborted) { setProduto(null); setErro(mensagemErro(falha)); } })
      .finally(() => { if (!abort.signal.aborted) setCarregando(false); });
    return () => abort.abort();
  }, [produtoId, tentativa]));

  async function confirmarExclusao() {
    if (ocupado.current) return;
    ocupado.current = true;
    setExcluindo(true); setErro('');
    try {
      await excluirProduto(produtoId);
      setConfirmando(false);
      navigation.popTo('ListaProdutos', { mensagem: 'Produto excluído com sucesso.' });
    } catch (falha) {
      setConfirmando(false); setErro(mensagemErro(falha));
    } finally { ocupado.current = false; setExcluindo(false); }
  }

  if (carregando) return <View style={styles.containerDetalhe}><ActivityIndicator size="large" color="#1B3A5C" /></View>;

  return <ScrollView style={styles.container} contentContainerStyle={styles.conteudoFormulario}>
    {produto && <>
      <Image accessibilityLabel={`Imagem de ${produto.nome}`} source={{ uri: produto.imagem }} style={styles.imagemDetalhe} />
      <Text style={styles.nomeDetalhe}>{produto.nome}</Text>
      <Text style={styles.precoDetalhe}>{formatarPreco(produto.preco)}</Text>
      <Text style={styles.categoriaDetalhe}>Categoria: {produto.categoria}</Text>
      <Text style={styles.estoqueDetalhe}>Em estoque: {produto.quantidade}</Text>
      <Text style={styles.descricaoDetalhe}>{produto.descricao}</Text>
      <TouchableOpacity accessibilityRole="button" disabled={excluindo} style={[styles.botaoPrincipal, styles.espacoSuperior]}
        onPress={() => navigation.navigate('CadastroProduto', { produtoId })}>
        <Text style={styles.textoBotaoPrincipal}>Editar produto</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={excluindo} style={styles.botaoExcluir} onPress={() => setConfirmando(true)}>
        <Text style={styles.textoExcluir}>Excluir produto</Text>
      </TouchableOpacity>
    </>}
    {erro !== '' && <Text accessibilityRole="alert" style={styles.erroLista}>{erro}</Text>}
    {erro !== '' && <TouchableOpacity accessibilityRole="button" style={styles.botaoCarregarMais} onPress={() => setTentativa((n) => n + 1)}>
      <Text style={styles.textoBotaoCarregarMais}>Tentar novamente</Text>
    </TouchableOpacity>}
    <TouchableOpacity accessibilityRole="button" style={styles.botaoCarregarMais} onPress={() => navigation.popTo('ListaProdutos')}>
      <Text style={styles.textoBotaoCarregarMais}>Voltar à lista</Text>
    </TouchableOpacity>
    <Modal visible={confirmando} transparent animationType="fade" onRequestClose={() => { if (!excluindo) setConfirmando(false); }}>
      <View style={styles.fundoModal}>
        <View accessibilityViewIsModal style={styles.modal}>
          <Text accessibilityRole="header" style={styles.nomeDetalhe}>Excluir produto?</Text>
          <Text style={styles.descricaoFormulario}>Deseja excluir “{produto?.nome}”? Essa ação remove o produto da loja.</Text>
          <TouchableOpacity accessibilityRole="button" disabled={excluindo} style={styles.botaoExcluir} onPress={() => { void confirmarExclusao(); }}>
            <Text style={styles.textoExcluir}>{excluindo ? 'Excluindo...' : 'Confirmar exclusão'}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={excluindo} style={styles.botaoCarregarMais} onPress={() => setConfirmando(false)}>
            <Text style={styles.textoBotaoCarregarMais}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </ScrollView>;
}
