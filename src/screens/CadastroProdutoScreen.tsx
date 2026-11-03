import { useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { cadastrarProduto } from '../services/produtosService';
import { styles } from '../styles/styles';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CadastroProduto'>;

const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=500&q=80';

export default function CadastroProdutoScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function limparErro(atualizar: (texto: string) => void, texto: string) {
    atualizar(texto);
    setErro('');
  }

  async function validarESalvar() {
    if (salvando) {
      return;
    }

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

    setSalvando(true);

    try {
      await cadastrarProduto({
        nome: nome.trim(),
        preco: precoNumerico,
        categoria: categoria.trim(),
        descricao: 'Produto cadastrado pela equipe da Loja Compre Bem.',
        imagem: IMAGEM_PADRAO,
        quantidade: 0,
      });
    } catch {
      setErro('Não foi possível cadastrar o produto na API. Tente novamente.');
      setSalvando(false);
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
        <Text style={styles.textoBotaoPrincipal}>{salvando ? 'Salvando...' : 'Salvar produto'}</Text>
      </TouchableOpacity>
    </View>
  );
}
