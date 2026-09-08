import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
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

const produtosIniciais = [
  {
    id: '1',
    nome: 'Cadeira Confort Plus',
    preco: 'R$ 349,90',
    categoria: 'Móveis',
    descricao: 'Cadeira para escritório com encosto acolchoado e apoio lombar.',
    imagem: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '2',
    nome: 'Mesa Escritório Slim',
    preco: 'R$ 459,00',
    categoria: 'Móveis',
    descricao: 'Mesa compacta de madeira com espaço para notebook e materiais.',
    imagem: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '3',
    nome: 'Luminária de Mesa LED',
    preco: 'R$ 89,90',
    categoria: 'Iluminação',
    descricao: 'Luminária articulada com luz branca para estudo e trabalho.',
    imagem: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '4',
    nome: 'Suporte para Notebook',
    preco: 'R$ 129,90',
    categoria: 'Informática',
    descricao: 'Suporte ajustável que melhora a altura da tela do notebook.',
    imagem: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '5',
    nome: 'Teclado Sem Fio Compacto',
    preco: 'R$ 159,90',
    categoria: 'Informática',
    descricao: 'Teclado sem fio com conexão Bluetooth e formato compacto.',
    imagem: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '6',
    nome: 'Organizador de Mesa',
    preco: 'R$ 49,90',
    categoria: 'Organização',
    descricao: 'Organizador para canetas, papéis e objetos pequenos da mesa.',
    imagem: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=500&q=80',
  },
];

function ProdutoItem({ produto, categoria, onPress }) {
  const [favorito, setFavorito] = useState(false);
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
        <Text style={styles.preco}>{produto.preco}</Text>

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
          <TouchableOpacity style={styles.botaoFavorito} onPress={() => setFavorito(!favorito)}>
            <Text style={styles.textoFavorito}>{favorito ? 'Salvo' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TelaListaProdutos({ navigation, produtos }) {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listaConteudo}
      data={produtos}
      keyExtractor={(produto) => produto.id}
      renderItem={({ item }) => (
        <ProdutoItem
          produto={item}
          categoria={item.categoria}
          onPress={() => navigation.navigate('DetalheProduto', { produtoId: item.id })}
        />
      )}
      ListHeaderComponent={
        <>
          <StatusBar style="auto" />
          <Text style={styles.titulo}>Loja Compre Bem</Text>
          <Text style={styles.subtitulo}>Produtos para deixar seu espaço de trabalho mais prático.</Text>

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
  const produto = produtos.find((item) => item.id === produtoId) ?? produtos[0];

  return (
    <View style={styles.containerDetalhe}>
      <StatusBar style="auto" />
      <Image source={{ uri: produto.imagem }} style={styles.imagemDetalhe} />
      <Text style={styles.nomeDetalhe}>{produto.nome}</Text>
      <Text style={styles.precoDetalhe}>{produto.preco}</Text>
      <Text style={styles.categoriaDetalhe}>Categoria: {produto.categoria}</Text>
      <Text style={styles.descricaoDetalhe}>{produto.descricao}</Text>
    </View>
  );
}

function TelaCadastroProduto({ navigation, onAdicionarProduto }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [erro, setErro] = useState('');

  function limparErro(atualizar, texto) {
    atualizar(texto);
    setErro('');
  }

  function validarESalvar() {
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

    onAdicionarProduto({
      id: Date.now().toString(),
      nome: nome.trim(),
      preco: `R$ ${precoNumerico.toFixed(2).replace('.', ',')}`,
      categoria: categoria.trim(),
      descricao: 'Produto cadastrado pela equipe da Loja Compre Bem.',
      imagem: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=500&q=80',
    });

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
  const [produtos, setProdutos] = useState(produtosIniciais);

  function adicionarProduto(produto) {
    setProdutos((listaAtual) => [...listaAtual, produto]);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaProdutos">
        <Stack.Screen name="ListaProdutos" options={{ title: 'Loja Compre Bem' }}>
          {(props) => <TelaListaProdutos {...props} produtos={produtos} />}
        </Stack.Screen>
        <Stack.Screen name="DetalheProduto" options={{ title: 'Detalhe do produto' }}>
          {(props) => <TelaDetalheProduto {...props} produtos={produtos} />}
        </Stack.Screen>
        <Stack.Screen name="CadastroProduto" options={{ title: 'Cadastro de produto' }}>
          {(props) => <TelaCadastroProduto {...props} onAdicionarProduto={adicionarProduto} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    paddingHorizontal: 16,
  },
  listaConteudo: {
    paddingBottom: 24,
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
    padding: 12,
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
    marginTop: 9,
  },
  botaoPequeno: {
    alignItems: 'center',
    backgroundColor: '#E8EDF2',
    borderRadius: 4,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  textoBotaoPequeno: {
    color: '#1B3A5C',
    fontSize: 17,
    fontWeight: 'bold',
  },
  quantidade: {
    color: '#4C5968',
    fontSize: 13,
    marginHorizontal: 7,
  },
  botaoFavorito: {
    marginLeft: 'auto',
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
  erro: {
    color: '#C62828',
    fontSize: 14,
    marginTop: 14,
  },
});
