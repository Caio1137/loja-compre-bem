package com.senai.jonatas.comprebem.config;

import com.senai.jonatas.comprebem.entity.Produto;
import com.senai.jonatas.comprebem.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CargaInicialProdutos implements CommandLineRunner {

    private static final String UNSPLASH = "https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=500&q=80";

    private static final Map<String, String> IMAGEM_POR_CATEGORIA = Map.of(
            "Móveis", "1586023492125-27b2c045efd7",
            "Iluminação", "1507473885765-e6ed057f782c",
            "Informática", "1587829741301-dc798b83add3",
            "Organização", "1494438639946-1ebd1d20bf85",
            "Papelaria", "1499951360447-b19be8fe80f5",
            "Acessórios", "1517336714731-489689fd1ca8"
    );

    private final ProdutoRepository produtoRepository;

    @Override
    public void run(String... args) {
        if (produtoRepository.count() > 0) {
            return;
        }

        produtoRepository.saveAll(List.of(
                produto("Cadeira Confort Plus", "Móveis", "349.90", 15, "Cadeira para escritório com encosto acolchoado e apoio lombar."),
                produto("Cadeira Ergonômica Pro", "Móveis", "899.00", 8, "Cadeira com regulagem de altura, braços 3D e encosto em tela."),
                produto("Cadeira Gamer Racer", "Móveis", "1199.90", 5, "Cadeira reclinável com almofadas para lombar e pescoço."),
                produto("Cadeira Fixa Interlocutor", "Móveis", "219.90", 20, "Cadeira fixa para salas de reunião e recepção."),
                produto("Mesa Escritório Slim", "Móveis", "459.00", 10, "Mesa compacta de madeira com espaço para notebook e materiais."),
                produto("Mesa em L Executiva", "Móveis", "1290.00", 4, "Mesa de canto em L com tampo amplo e passa-fios."),
                produto("Mesa Regulável Standing", "Móveis", "2190.00", 3, "Mesa com ajuste elétrico de altura para trabalhar em pé ou sentado."),
                produto("Gaveteiro Volante 3 Gavetas", "Móveis", "389.90", 12, "Gaveteiro com rodízios e chave para documentos."),
                produto("Estante de Livros 5 Prateleiras", "Móveis", "529.00", 6, "Estante em MDF para livros, pastas e caixas."),
                produto("Banqueta Alta Giratória", "Móveis", "279.90", 9, "Banqueta com regulagem de altura para bancadas."),

                produto("Luminária de Mesa LED", "Iluminação", "89.90", 25, "Luminária articulada com luz branca para estudo e trabalho."),
                produto("Luminária de Mesa com Carregador", "Iluminação", "179.90", 14, "Luminária LED com base de carregamento sem fio."),
                produto("Luminária de Piso Arco", "Iluminação", "429.00", 5, "Luminária de chão com haste curva para salas e escritórios."),
                produto("Barra de Luz para Monitor", "Iluminação", "199.90", 11, "Barra de LED que ilumina a mesa sem refletir na tela."),
                produto("Fita de LED 5 Metros", "Iluminação", "69.90", 30, "Fita de LED com controle remoto e 16 cores."),
                produto("Lâmpada Inteligente Wi-Fi", "Iluminação", "59.90", 40, "Lâmpada com controle pelo celular e ajuste de temperatura."),
                produto("Luminária Clipe Flexível", "Iluminação", "49.90", 22, "Luminária com prendedor para prateleiras e cabeceiras."),
                produto("Ring Light 26 cm", "Iluminação", "149.90", 13, "Iluminador circular com tripé para videochamadas."),
                produto("Luminária Pendente Industrial", "Iluminação", "239.00", 7, "Pendente metálico para iluminar mesas de reunião."),
                produto("Abajur Cerâmica Clássico", "Iluminação", "129.90", 9, "Abajur com cúpula de tecido e base de cerâmica."),

                produto("Suporte para Notebook", "Informática", "129.90", 18, "Suporte ajustável que melhora a altura da tela do notebook."),
                produto("Teclado Sem Fio Compacto", "Informática", "159.90", 21, "Teclado sem fio com conexão Bluetooth e formato compacto."),
                produto("Teclado Mecânico RGB", "Informática", "349.90", 10, "Teclado mecânico com switches táteis e iluminação RGB."),
                produto("Mouse Sem Fio Silencioso", "Informática", "79.90", 35, "Mouse com cliques silenciosos e pilha de longa duração."),
                produto("Mouse Vertical Ergonômico", "Informática", "139.90", 12, "Mouse vertical que reduz a tensão no punho."),
                produto("Monitor 24 Polegadas Full HD", "Informática", "899.90", 6, "Monitor IPS com bordas finas e entrada HDMI."),
                produto("Webcam Full HD 1080p", "Informática", "229.90", 15, "Webcam com microfone embutido para reuniões online."),
                produto("Hub USB-C 7 em 1", "Informática", "189.90", 17, "Adaptador com HDMI, USB 3.0, leitor de cartão e carga."),
                produto("Headset com Microfone", "Informática", "199.90", 14, "Headset confortável com cancelamento de ruído no microfone."),
                produto("SSD Externo 1 TB", "Informática", "549.90", 8, "SSD portátil com conexão USB-C e alta velocidade."),

                produto("Organizador de Mesa", "Organização", "49.90", 28, "Organizador para canetas, papéis e objetos pequenos da mesa."),
                produto("Caixa Organizadora com Tampa", "Organização", "39.90", 33, "Caixa plástica empilhável para arquivos e materiais."),
                produto("Porta-Documentos Vertical", "Organização", "34.90", 26, "Porta-documentos com três divisórias para pastas."),
                produto("Organizador de Cabos", "Organização", "24.90", 45, "Kit de clipes e canaletas para esconder fios da mesa."),
                produto("Painel Pegboard de Parede", "Organização", "119.90", 10, "Painel perfurado com ganchos para pendurar acessórios."),
                produto("Bandeja de Gaveta Modular", "Organização", "29.90", 30, "Bandejas que se encaixam para organizar gavetas."),
                produto("Arquivo Sanfonado A4", "Organização", "44.90", 19, "Pasta sanfonada com 13 divisórias e fecho elástico."),
                produto("Nicho de Parede Hexagonal", "Organização", "89.90", 8, "Nicho decorativo para livros e objetos pequenos."),
                produto("Porta-Canetas Giratório", "Organização", "32.90", 24, "Porta-canetas com compartimentos que giram 360 graus."),
                produto("Gaveteiro de Mesa Mini", "Organização", "59.90", 16, "Pequeno gaveteiro de mesa para clipes e grampos."),

                produto("Caderno Universitário 10 Matérias", "Papelaria", "32.90", 50, "Caderno espiral com 200 folhas pautadas."),
                produto("Planner Semanal", "Papelaria", "59.90", 22, "Planner com visão semanal, metas e lista de tarefas."),
                produto("Kit Canetas Gel Coloridas", "Papelaria", "27.90", 40, "Conjunto com 12 canetas gel de cores variadas."),
                produto("Marca-Texto Pastel 6 Cores", "Papelaria", "24.90", 38, "Marca-textos em tons pastel com ponta chanfrada."),
                produto("Bloco de Notas Adesivas", "Papelaria", "14.90", 60, "Bloco com 400 notas adesivas em cores neon."),
                produto("Grampeador de Mesa", "Papelaria", "36.90", 20, "Grampeador metálico para até 25 folhas."),
                produto("Quadro Branco 60 x 40", "Papelaria", "89.90", 9, "Quadro magnético com moldura de alumínio e suporte."),
                produto("Agenda 2027 Capa Dura", "Papelaria", "49.90", 25, "Agenda diária com capa dura e marcador de página."),
                produto("Calculadora de Mesa 12 Dígitos", "Papelaria", "39.90", 18, "Calculadora com visor grande e energia solar."),
                produto("Resma Papel A4 500 Folhas", "Papelaria", "29.90", 55, "Papel sulfite branco de 75 g para impressão."),

                produto("Apoio para os Pés Ajustável", "Acessórios", "99.90", 14, "Apoio com inclinação regulável para melhorar a postura."),
                produto("Apoio de Punho para Teclado", "Acessórios", "44.90", 23, "Apoio em espuma viscoelástica para digitar com conforto."),
                produto("Mouse Pad Grande", "Acessórios", "54.90", 27, "Mouse pad estendido que cobre teclado e mouse."),
                produto("Suporte para Monitor Articulado", "Acessórios", "249.90", 9, "Braço articulado com fixação na mesa para um monitor."),
                produto("Almofada Lombar para Cadeira", "Acessórios", "79.90", 16, "Almofada que se prende ao encosto da cadeira."),
                produto("Suporte para Celular de Mesa", "Acessórios", "29.90", 40, "Suporte dobrável para celular e tablet."),
                produto("Garrafa Térmica 500 ml", "Acessórios", "69.90", 30, "Garrafa de inox que mantém a bebida gelada por 24 horas."),
                produto("Caneca de Cerâmica Escritório", "Acessórios", "34.90", 35, "Caneca de 350 ml com tampa de bambu."),
                produto("Mochila para Notebook 15,6\"", "Acessórios", "189.90", 12, "Mochila com compartimento acolchoado e saída USB."),
                produto("Filtro de Linha 6 Tomadas", "Acessórios", "64.90", 21, "Filtro de linha com proteção contra surtos e chave liga/desliga.")
        ));
    }

    private Produto produto(String nome, String categoria, String preco, int quantidade, String descricao) {
        Produto produto = new Produto();
        produto.setNome(nome);
        produto.setCategoria(categoria);
        produto.setPreco(new BigDecimal(preco));
        produto.setQuantidade(quantidade);
        produto.setDescricao(descricao);
        produto.setImagem(UNSPLASH.formatted(IMAGEM_POR_CATEGORIA.get(categoria)));
        return produto;
    }
}
