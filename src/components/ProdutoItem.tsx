import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';
import { formatarPreco } from '../utils/formatarPreco';
import type { Produto } from '../types/produto';

type Props = {
  produto: Produto;
  favorito: boolean;
  onAlternarFavorito: () => void;
  onPress: () => void;
};

export default function ProdutoItem({ produto, favorito, onAlternarFavorito, onPress }: Props) {
  const [quantidade, setQuantidade] = useState(0);

  function diminuirQuantidade() {
    if (quantidade > 0) {
      setQuantidade(quantidade - 1);
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver imagem de ${produto.nome}`} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: produto.imagem }} style={styles.imagemLista} />
      </TouchableOpacity>

      <View style={styles.informacoesCard}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver ${produto.nome}`} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.nomeProduto}>{produto.nome}</Text>
          <Text style={styles.categoria}>Categoria: {produto.categoria}</Text>
          <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>
        </TouchableOpacity>

        <View style={styles.linhaAcoes}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Diminuir quantidade de ${produto.nome}`} style={styles.botaoPequeno} onPress={diminuirQuantidade}>
            <Text style={styles.textoBotaoPequeno}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantidade}>Qtd.: {quantidade}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Aumentar quantidade de ${produto.nome}`}
            style={styles.botaoPequeno}
            onPress={() => setQuantidade(quantidade + 1)}
          >
            <Text style={styles.textoBotaoPequeno}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${favorito ? 'Remover dos favoritos' : 'Favoritar'} ${produto.nome}`} style={styles.botaoFavorito} onPress={onAlternarFavorito}>
            <Text style={styles.textoFavorito}>{favorito ? 'Salvo' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
