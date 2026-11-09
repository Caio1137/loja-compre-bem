export type RootStackParamList = {
  ListaProdutos: { mensagem?: string } | undefined;
  DetalheProduto: { produtoId: string };
  CadastroProduto: { produtoId?: string } | undefined;
};
