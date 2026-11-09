import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mensagemErro } from '../services/api';
import { buscarProdutoPorId, cadastrarProduto, editarProduto } from '../services/produtosService';
import { styles } from '../styles/styles';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CadastroProduto'>;
const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=500&q=80';

export default function CadastroProdutoScreen({ navigation, route }: Props) {
  const produtoId = route.params?.produtoId;
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('0');
  const [imagem, setImagem] = useState('');
  const [erro, setErro] = useState('');
  const [erroCarga, setErroCarga] = useState('');
  const [carregando, setCarregando] = useState(!!produtoId);
  const [salvando, setSalvando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const ocupado = useRef(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: produtoId ? 'Editar produto' : 'Cadastrar produto' });
  }, [navigation, produtoId]);

  useEffect(() => {
    if (!produtoId) return;
    const abort = new AbortController();
    setCarregando(true);
    setErroCarga('');
    buscarProdutoPorId(produtoId, abort.signal)
      .then((produto) => {
        if (abort.signal.aborted) return;
        setNome(produto.nome); setPreco(String(produto.preco).replace('.', ','));
        setCategoria(produto.categoria); setDescricao(produto.descricao ?? '');
        setQuantidade(String(produto.quantidade)); setImagem(produto.imagem ?? '');
      })
      .catch((falha) => { if (!abort.signal.aborted) setErroCarga(mensagemErro(falha)); })
      .finally(() => { if (!abort.signal.aborted) setCarregando(false); });
    return () => abort.abort();
  }, [produtoId, tentativa]);

  function alterar(atualizar: (texto: string) => void, texto: string) {
    atualizar(texto); setErro('');
  }

  async function salvar() {
    if (ocupado.current) return;
    if (nome.trim().length < 2 || nome.trim().length > 100) {
      setErro('Informe um nome com 2 a 100 caracteres.'); return;
    }
    const valor = preco.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(valor) || Number(valor) <= 0 || Number(valor) > 99999999.99) {
      setErro('Informe um preço maior que zero, com até 8 dígitos e 2 casas decimais. Ex.: 89,90.'); return;
    }
    if (categoria.trim().length < 3 || categoria.trim().length > 80) {
      setErro('Informe uma categoria com 3 a 80 caracteres.'); return;
    }
    if (!/^\d+$/.test(quantidade.trim()) || Number(quantidade) > 2147483647) {
      setErro('O estoque deve ser um número inteiro entre 0 e 2147483647.'); return;
    }
    if (descricao.trim().length > 500) { setErro('A descrição deve ter até 500 caracteres.'); return; }
    if (imagem.trim() && (!/^https?:\/\/\S+$/i.test(imagem.trim()) || imagem.trim().length > 255)) {
      setErro('Informe um endereço de imagem http ou https com até 255 caracteres.'); return;
    }

    ocupado.current = true;
    setSalvando(true); setErro('');
    try {
      const dados = { nome: nome.trim(), preco: Number(valor), categoria: categoria.trim(),
        descricao: descricao.trim(), quantidade: Number(quantidade), imagem: imagem.trim() || IMAGEM_PADRAO };
      if (produtoId) await editarProduto(produtoId, dados);
      else await cadastrarProduto(dados);
      Keyboard.dismiss();
      navigation.popTo('ListaProdutos', { mensagem: produtoId ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.' });
    } catch (falha) {
      setErro(mensagemErro(falha));
    } finally {
      ocupado.current = false; setSalvando(false);
    }
  }

  if (carregando || erroCarga) return <View style={styles.containerDetalhe}>
    {carregando ? <ActivityIndicator size="large" color="#1B3A5C" /> : <>
      <Text accessibilityRole="alert" style={styles.erroLista}>{erroCarga}</Text>
      <TouchableOpacity accessibilityRole="button" style={styles.botaoCarregarMais} onPress={() => setTentativa((n) => n + 1)}>
        <Text style={styles.textoBotaoCarregarMais}>Tentar novamente</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" style={styles.botaoCarregarMais} onPress={() => navigation.popTo('ListaProdutos')}>
        <Text style={styles.textoBotaoCarregarMais}>Voltar à lista</Text>
      </TouchableOpacity>
    </>}
  </View>;

  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudoFormulario}>
      <Text style={styles.descricaoFormulario}>{produtoId ? 'Atualize os dados do produto. As alterações serão gravadas na API.' : 'Preencha os dados para adicionar um produto ao catálogo da loja.'}</Text>
      <Text style={styles.rotulo}>Nome do produto *</Text>
      <TextInput style={styles.input} accessibilityLabel="Nome do produto" placeholder="Ex.: Apoio para os pés" value={nome} editable={!salvando}
        onChangeText={(texto) => alterar(setNome, texto)} maxLength={100} />
      <Text style={styles.rotulo}>Preço (R$) *</Text>
      <TextInput style={styles.input} accessibilityLabel="Preço" placeholder="Ex.: 89,90" value={preco} editable={!salvando}
        onChangeText={(texto) => alterar(setPreco, texto)} keyboardType="decimal-pad" />
      <Text style={styles.rotulo}>Categoria *</Text>
      <TextInput style={styles.input} accessibilityLabel="Categoria" placeholder="Ex.: Organização" value={categoria} editable={!salvando}
        onChangeText={(texto) => alterar(setCategoria, texto)} maxLength={80} />
      <Text style={styles.rotulo}>Quantidade em estoque *</Text>
      <TextInput style={styles.input} accessibilityLabel="Quantidade em estoque" value={quantidade} editable={!salvando}
        onChangeText={(texto) => alterar(setQuantidade, texto)} keyboardType="number-pad" />
      <Text style={styles.rotulo}>Descrição</Text>
      <TextInput style={[styles.input, styles.inputDescricao]} accessibilityLabel="Descrição" placeholder="Detalhes do produto" value={descricao} editable={!salvando}
        onChangeText={(texto) => alterar(setDescricao, texto)} multiline maxLength={500} />
      <Text style={styles.rotulo}>Endereço da imagem (opcional)</Text>
      <TextInput style={styles.input} accessibilityLabel="Endereço da imagem" placeholder="https://..." value={imagem} editable={!salvando}
        onChangeText={(texto) => alterar(setImagem, texto)} autoCapitalize="none" keyboardType="url" maxLength={255} />
      <Text style={styles.ajuda}>* Campos obrigatórios. Sem endereço de imagem, usaremos a imagem padrão.</Text>
      {erro !== '' && <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text>}
      <TouchableOpacity accessibilityRole="button" disabled={salvando} style={[styles.botaoPrincipal, styles.espacoSuperior, salvando && styles.desabilitado]} onPress={() => { void salvar(); }}>
        <Text style={styles.textoBotaoPrincipal}>{salvando ? 'Salvando...' : produtoId ? 'Salvar alterações' : 'Salvar produto'}</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}
