// Espelha o ProdutoResponseDTO da API.
export type Produto = {
  produtoId: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem: string;
  quantidade: number;
};

export type NovoProduto = Omit<Produto, 'produtoId'>;
