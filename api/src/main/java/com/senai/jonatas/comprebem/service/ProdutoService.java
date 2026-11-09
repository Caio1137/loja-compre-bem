package com.senai.jonatas.comprebem.service;

import com.senai.jonatas.comprebem.dto.ProdutoRequestDTO;
import com.senai.jonatas.comprebem.dto.ProdutoResponseDTO;
import com.senai.jonatas.comprebem.entity.Produto;
import com.senai.jonatas.comprebem.exception.ProdutoNaoEncontradoException;
import com.senai.jonatas.comprebem.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public Page<ProdutoResponseDTO> findAll(String busca, Pageable pageable) {
        Page<Produto> produtos = (busca == null || busca.isBlank())
                ? produtoRepository.findAll(pageable)
                : produtoRepository.findByNomeContainingIgnoreCase(busca.trim(), pageable);

        return produtos.map(ProdutoResponseDTO::toDto);
    }

    public ProdutoResponseDTO findById(UUID id) {
        var produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));

        return ProdutoResponseDTO.toDto(produto);
    }

    public Page<ProdutoResponseDTO> findByFiltro(String filtro, Pageable pageable) {
        return produtoRepository.findByFiltro(filtro.trim(), pageable)
                .map(ProdutoResponseDTO::toDto);
    }

    public ProdutoResponseDTO save(ProdutoRequestDTO produto) {
        Produto produtoSalvo = produtoRepository.save(Produto.toEntity(produto));
        return ProdutoResponseDTO.toDto(produtoSalvo);
    }

    public void delete(UUID produtoId) {
        if (!produtoRepository.existsById(produtoId)) {
            throw new ProdutoNaoEncontradoException(produtoId);
        }

        produtoRepository.deleteById(produtoId);
    }

    public ProdutoResponseDTO update(UUID produtoId, ProdutoRequestDTO produto) {
        Produto produtoExistente = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(produtoId));

        produtoExistente.setNome(produto.nome());
        produtoExistente.setDescricao(produto.descricao());
        produtoExistente.setPreco(produto.preco());
        produtoExistente.setCategoria(produto.categoria());
        produtoExistente.setImagem(produto.imagem());
        produtoExistente.setQuantidade(produto.quantidade() == null ? 0 : produto.quantidade());

        Produto produtoAtualizado = produtoRepository.save(produtoExistente);
        return ProdutoResponseDTO.toDto(produtoAtualizado);

    }
}
