package com.senai.jonatas.comprebem.exception;

public record ErroResponseDTO(
        int status,
        String mensagem
) {
}
