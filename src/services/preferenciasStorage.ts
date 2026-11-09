import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_FAVORITOS = '@compre_bem:favoritos';
const CHAVE_ULTIMA_BUSCA = '@compre_bem:ultima_busca';

export async function carregarFavoritos(): Promise<string[]> {
  const favoritosSalvos = await AsyncStorage.getItem(CHAVE_FAVORITOS);
  const dados: unknown = favoritosSalvos ? JSON.parse(favoritosSalvos) : [];
  return Array.isArray(dados) ? dados.filter((id): id is string => typeof id === 'string') : [];
}

export async function salvarFavoritos(favoritos: string[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
}

export async function carregarUltimaBusca(): Promise<string> {
  return (await AsyncStorage.getItem(CHAVE_ULTIMA_BUSCA)) ?? '';
}

export async function salvarUltimaBusca(busca: string): Promise<void> {
  await AsyncStorage.setItem(CHAVE_ULTIMA_BUSCA, busca);
}
