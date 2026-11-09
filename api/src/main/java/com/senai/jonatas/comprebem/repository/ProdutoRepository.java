package com.senai.jonatas.comprebem.repository;

import com.senai.jonatas.comprebem.entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {

    Page<Produto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    @Query("""
            SELECT p FROM Produto p
            WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :filtro, '%'))
               OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :filtro, '%'))
               OR LOWER(p.categoria) LIKE LOWER(CONCAT('%', :filtro, '%'))
            """)
    Page<Produto> findByFiltro(String filtro, Pageable pageable);
}
