package com.senai.jonatas.comprebem.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public record ProdutoRequestDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(min = 2, max = 100, message = "O nome deve ter de 2 a 100 caracteres.") String nome,
        @Size(max = 500, message = "A descrição deve ter até 500 caracteres.") String descricao,
        @NotNull(message = "O preço é obrigatório.")
        @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero.")
        @Digits(integer = 8, fraction = 2, message = "O preço deve ter até 8 dígitos e 2 casas decimais.") BigDecimal preco,
        @NotBlank(message = "A categoria é obrigatória.")
        @Size(min = 3, max = 80, message = "A categoria deve ter de 3 a 80 caracteres.") String categoria,
        @NotBlank(message = "O endereço da imagem é obrigatório.")
        @Size(max = 255, message = "O endereço da imagem deve ter até 255 caracteres.")
        @Pattern(regexp = "https?://\\S+", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Use um endereço de imagem http ou https.") String imagem,
        @NotNull(message = "A quantidade é obrigatória.")
        @PositiveOrZero(message = "O estoque não pode ser negativo.") Integer quantidade
) {
    public ProdutoRequestDTO {
        nome = nome == null ? null : nome.trim();
        categoria = categoria == null ? null : categoria.trim();
        descricao = descricao == null ? null : descricao.trim();
        imagem = imagem == null ? null : imagem.trim();
    }
}
