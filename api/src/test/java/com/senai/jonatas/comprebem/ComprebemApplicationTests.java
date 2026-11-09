package com.senai.jonatas.comprebem;

import com.jayway.jsonpath.JsonPath;
import com.senai.jonatas.comprebem.config.CargaInicialProdutos;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:atividade;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class ComprebemApplicationTests {
    private static final String ROTA = "/api/v1/produtos";
    private static final String VALIDO = """
            {"nome":"Produto da atividade", "descricao":"Teste de persistência",
             "preco":89.90, "categoria":"Papelaria", "quantidade":7,
             "imagem":"https://example.com/produto.png"}
            """;

    @Autowired MockMvc mvc;
    @Autowired CargaInicialProdutos carga;

    @Test
    void cargaInicialTem60ProdutosSemDuplicarAoReiniciar() throws Exception {
        carga.run();
        mvc.perform(get(ROTA)).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(60))
                .andExpect(jsonPath("$.page.totalPages").value(3))
                .andExpect(jsonPath("$.content.length()").value(20));
    }

    @Test
    void paginasNaoRepetemProdutosERespeitamLimite() throws Exception {
        var ids = new HashSet<String>();
        for (int pagina = 0; pagina < 3; pagina++) {
            String resposta = mvc.perform(get(ROTA + "/filtro").param("page", String.valueOf(pagina)))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(20))
                    .andReturn().getResponse().getContentAsString();
            List<String> paginaIds = JsonPath.read(resposta, "$.content[*].produtoId");
            for (String id : paginaIds) assertTrue(ids.add(id), "Produto repetido entre páginas");
        }
        assertEquals(60, ids.size());
        mvc.perform(get(ROTA).param("size", "500"))
                .andExpect(jsonPath("$.content.length()").value(50));
    }

    @Test
    void crudCompletoGravaAlteracoesEExcluiProduto() throws Exception {
        String resposta = mvc.perform(post(ROTA).contentType(MediaType.APPLICATION_JSON).content(VALIDO))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(resposta, "$.produtoId");
        try {
            mvc.perform(get(ROTA + "/" + id)).andExpect(status().isOk())
                    .andExpect(jsonPath("$.nome").value("Produto da atividade"));
            mvc.perform(put(ROTA + "/" + id).contentType(MediaType.APPLICATION_JSON)
                            .content(VALIDO.replace("89.90", "129.50").replace("atividade", "atividade editado")))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.preco").value(129.50));
            mvc.perform(get(ROTA + "/" + id)).andExpect(jsonPath("$.nome").value("Produto da atividade editado"))
                    .andExpect(jsonPath("$.preco").value(129.50));
        } finally {
            mvc.perform(delete(ROTA + "/" + id)).andExpect(status().isNoContent()).andExpect(content().string(""));
        }
        mvc.perform(get(ROTA + "/" + id)).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").isNotEmpty());
    }

    @Test
    void rejeitaDadosInvalidosNoCadastroENaEdicao() throws Exception {
        for (String corpo : List.of(
                VALIDO.replace("Produto da atividade", " "), VALIDO.replace("Produto da atividade", " a "), VALIDO.replace("89.90", "-1"),
                VALIDO.replace("89.90", "1.234"), VALIDO.replace("Papelaria", "a"),
                VALIDO.replace("\"quantidade\":7", "\"quantidade\":-1"),
                VALIDO.replace("\"quantidade\":7", "\"quantidade\":1.5"),
                VALIDO.replace("https://example.com/produto.png", "endereco-invalido"), "{}")) {
            mvc.perform(post(ROTA).contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").isNotEmpty());
            mvc.perform(put(ROTA + "/" + UUID.randomUUID()).contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").isNotEmpty());
        }
    }

    @Test
    void produtoInexistenteRetorna404EmTodasAsOperacoes() throws Exception {
        String rota = ROTA + "/" + UUID.randomUUID();
        mvc.perform(get(rota)).andExpect(status().isNotFound()).andExpect(jsonPath("$.mensagem").isNotEmpty());
        mvc.perform(put(rota).contentType(MediaType.APPLICATION_JSON).content(VALIDO)).andExpect(status().isNotFound());
        mvc.perform(delete(rota)).andExpect(status().isNotFound());
    }

    @Test
    void jsonOuIdentificadorInvalidoRetornaMensagemClara() throws Exception {
        mvc.perform(get(ROTA + "/id-invalido")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").isNotEmpty());
        mvc.perform(post(ROTA).contentType(MediaType.APPLICATION_JSON).content("{invalido"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").isNotEmpty());
    }

    @Test
    void filtroBuscaNomeECategoriaSemDiferenciarMaiusculas() throws Exception {
        mvc.perform(get(ROTA + "/filtro").param("filtro", "  pAPELaria  "))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page.totalElements").value(10));
        mvc.perform(get(ROTA + "/filtro").param("filtro", "produto-sem-correspondencia"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(0));
    }
}
