import { useCallback, useEffect, useState } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Stack = createNativeStackNavigator();
const CHAVE_FAVORITOS = '@compre_bem:favoritos';
const CHAVE_ULTIMA_BUSCA = '@compre_bem:ultima_busca';

// No celular com Expo Go, troque localhost pelo IP do computador na rede.
const API_URL = 'http://localhost:8080/api/v1';
const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=500&q=80';

function formatarPreco(preco) {
  return `R$ ${Number(preco).toFixed(2).replace('.', ',')}`;
}

async function buscarProdutos() {
  const resposta = await fetch(`${API_URL}/produtos`);

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao buscar produtos.`);
  }

  const pagina = await resposta.json();
  return pagina.content;
}

async function cadastrarProduto(produto) {
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produto),
  });

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao cadastrar produto.`);
  }

  return resposta.json();
}

function ProdutoItem({ produto, categoria, favorito, onAlternarFavorito, onPress }) {
  const [quantidade, setQuantidade] = useState(0);

  function diminuirQuantidade() {
    if (quantidade > 0) {
      setQuantidade(quantidade - 1);
    }
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: produto.imagem }} style={styles.imagemLista} />

      <View style={styles.informacoesCard}>
        <Text style={styles.nomeProduto}>{produto.nome}</Text>
        <Text style={styles.categoria}>Categoria: {categoria}</Text>
        <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>

        <View style={styles.linhaAcoes}>
          <TouchableOpacity style={styles.botaoPequeno} onPress={diminuirQuantidade}>
            <Text style={styles.textoBotaoPequeno}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantidade}>Qtd.: {quantidade}</Text>
          <TouchableOpacity
            style={styles.botaoPequeno}
            onPress={() => setQuantidade(quantidade + 1)}
          >
            <Text style={styles.textoBotaoPequeno}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoFavorito} onPress={onAlternarFavorito}>
            <Text style={styles.textoFavorito}>{favorito ? 'Salvo' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TelaListaProdutos({ navigation, produtos, onProdutosCarregados }) {
  const [favoritos, setFavoritos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState('');

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErroApi('');

    try {
      onProdutosCarregados(await buscarProdutos());
    } catch (error) {
      setErroApi('Não foi possível carregar os produtos. Verifique se a API está ligada.');
    } finally {
      setCarregando(false);
    }
  }, [onProdutosCarregados]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos]),
  );

  useEffect(() => {
    async function carregarDadosSalvos() {
      try {
        const favoritosSalvos = await AsyncStorage.getItem(CHAVE_FAVORITOS);
        const buscaSalva = await AsyncStorage.getItem(CHAVE_ULTIMA_BUSCA);

        if (favoritosSalvos) {
          setFavoritos(JSON.parse(favoritosSalvos));
        }

        if (buscaSalva) {
          setBusca(buscaSalva);
        }
      } catch (error) {
        setFavoritos([]);
      }
    }

    carregarDadosSalvos();
  }, []);

  function alternarFavorito(id) {
    setFavoritos((atual) => {
      const novosFavoritos = atual.includes(id)
        ? atual.filter((favoritoId) => favoritoId !== id)
        : [...atual, id];

      AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(novosFavoritos));
      return novosFavoritos;
    });
  }

  function atualizarBusca(texto) {
    setBusca(texto);
    AsyncStorage.setItem(CHAVE_ULTIMA_BUSCA, texto);
  }

  const textoBusca = busca.trim().toLowerCase();
  const produtosFiltrados = produtos.filter((produto) => (
    produto.nome.toLowerCase().includes(textoBusca)
    || produto.categoria.toLowerCase().includes(textoBusca)
  ));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listaConteudo}
      data={produtosFiltrados}
      keyExtractor={(produto) => produto.produtoId}
      renderItem={({ item }) => (
        <ProdutoItem
          produto={item}
          categoria={item.categoria}
          favorito={favoritos.includes(item.produtoId)}
          onAlternarFavorito={() => alternarFavorito(item.produtoId)}
          onPress={() => navigation.navigate('DetalheProduto', { produtoId: item.produtoId })}
        />
      )}
      ListEmptyComponent={
        carregando
          ? <ActivityIndicator style={styles.carregando} size="large" color="#1B3A5C" />
          : <Text style={erroApi ? styles.erroLista : styles.listaVazia}>{erroApi || 'Nenhum produto encontrado.'}</Text>
      }
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
        </>
      }
    />
  );
}

function TelaDetalheProduto({ route, produtos }) {
  const { produtoId } = route.params;
  const produto = produtos.find((item) => item.produtoId === produtoId);

  if (!produto) {
    return (
      <View style={styles.containerDetalhe}>
        <Text style={styles.listaVazia}>Produto não encontrado.</Text>
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
      <Text style={styles.descricaoDetalhe}>{produto.descricao}</Text>
    </View>
  );
}

function TelaCadastroProduto({ navigation }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [erro, setErro] = useState('');

  function limparErro(atualizar, texto) {
    atualizar(texto);
    setErro('');
  }

  async function validarESalvar() {
    if (nome.trim() === '') {
      setErro('O nome do produto não pode ficar vazio.');
      return;
    }

    const precoNumerico = Number(preco.trim().replace(',', '.'));
    if (preco.trim() === '' || isNaN(precoNumerico) || precoNumerico <= 0) {
      setErro('Informe um preço numérico maior que zero.');
      return;
    }

    if (categoria.trim().length < 3) {
      setErro('Informe uma categoria com pelo menos 3 caracteres.');
      return;
    }

    try {
      await cadastrarProduto({
        nome: nome.trim(),
        preco: precoNumerico,
        categoria: categoria.trim(),
        descricao: 'Produto cadastrado pela equipe da Loja Compre Bem.',
        imagem: IMAGEM_PADRAO,
        quantidade: 0,
      });
    } catch (error) {
      setErro('Não foi possível cadastrar o produto na API. Tente novamente.');
      return;
    }

    Keyboard.dismiss();
    navigation.goBack();
  }

  return (
    <View style={styles.containerFormulario}>
      <StatusBar style="auto" />
      <Text style={styles.descricaoFormulario}>Preencha os dados do produto que será adicionado à lista.</Text>

      <Text style={styles.rotulo}>Nome do produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Apoio para os pés"
        value={nome}
        onChangeText={(texto) => limparErro(setNome, texto)}
        returnKeyType="next"
      />

      <Text style={styles.rotulo}>Preço</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: 89,90"
        value={preco}
        onChangeText={(texto) => limparErro(setPreco, texto)}
        keyboardType="decimal-pad"
        returnKeyType="next"
      />

      <Text style={styles.rotulo}>Categoria</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Organização"
        value={categoria}
        onChangeText={(texto) => limparErro(setCategoria, texto)}
        returnKeyType="done"
        onSubmitEditing={validarESalvar}
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <TouchableOpacity style={styles.botaoPrincipal} onPress={validarESalvar} activeOpacity={0.8}>
        <Text style={styles.textoBotaoPrincipal}>Salvar produto</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [produtos, setProdutos] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaProdutos">
        <Stack.Screen name="ListaProdutos" options={{ title: 'Loja Compre Bem' }}>
          {(props) => <TelaListaProdutos {...props} produtos={produtos} onProdutosCarregados={setProdutos} />}
        </Stack.Screen>
        <Stack.Screen name="DetalheProduto" options={{ title: 'Detalhe do produto' }}>
          {(props) => <TelaDetalheProduto {...props} produtos={produtos} />}
        </Stack.Screen>
        <Stack.Screen
          name="CadastroProduto"
          component={TelaCadastroProduto}
          options={{ title: 'Cadastro de produto' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  listaConteudo: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  titulo: {
    color: '#1B3A5C',
    fontSize: 27,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 6,
  },
  subtitulo: {
    color: '#4C5968',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },
  tituloSecao: {
    color: '#1B3A5C',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  botaoPrincipal: {
    alignItems: 'center',
    backgroundColor: '#1B3A5C',
    borderRadius: 6,
    marginBottom: 18,
    padding: 13,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E0E8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    minWidth: 0,
    padding: 12,
    width: '100%',
  },
  imagemLista: {
    backgroundColor: '#E8EDF2',
    borderRadius: 6,
    height: 86,
    marginRight: 12,
    width: 86,
  },
  informacoesCard: {
    flex: 1,
    minWidth: 0,
  },
  nomeProduto: {
    color: '#1B3A5C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoria: {
    color: '#5C6773',
    fontSize: 13,
    marginTop: 4,
  },
  preco: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  linhaAcoes: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  botaoPequeno: {
    alignItems: 'center',
    backgroundColor: '#E8EDF2',
    borderRadius: 4,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  textoBotaoPequeno: {
    color: '#1B3A5C',
    fontSize: 17,
    fontWeight: 'bold',
  },
  quantidade: {
    color: '#4C5968',
    fontSize: 13,
    minHeight: 44,
    textAlignVertical: 'center',
  },
  botaoFavorito: {
    alignItems: 'center',
    backgroundColor: '#E8EDF2',
    borderRadius: 4,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
  },
  textoFavorito: {
    color: '#1B3A5C',
    fontSize: 13,
    fontWeight: 'bold',
  },
  containerDetalhe: {
    backgroundColor: '#F6F7FB',
    flex: 1,
    padding: 20,
  },
  imagemDetalhe: {
    backgroundColor: '#E8EDF2',
    borderRadius: 8,
    height: 220,
    marginBottom: 18,
    width: '100%',
  },
  nomeDetalhe: {
    color: '#1B3A5C',
    fontSize: 24,
    fontWeight: 'bold',
  },
  precoDetalhe: {
    color: '#2E7D32',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 8,
  },
  categoriaDetalhe: {
    color: '#4C5968',
    fontSize: 14,
    marginTop: 10,
  },
  descricaoDetalhe: {
    color: '#30363D',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 16,
  },
  containerFormulario: {
    backgroundColor: '#F6F7FB',
    flex: 1,
    padding: 20,
  },
  descricaoFormulario: {
    color: '#4C5968',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },
  rotulo: {
    color: '#1B3A5C',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B8C3CF',
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputBusca: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B8C3CF',
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  carregando: {
    marginTop: 24,
  },
  erroLista: {
    color: '#C62828',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  listaVazia: {
    color: '#4C5968',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  erro: {
    color: '#C62828',
    fontSize: 14,
    marginTop: 14,
  },
});
