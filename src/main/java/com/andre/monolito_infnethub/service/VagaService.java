package com.andre.monolito_infnethub.service;

import com.andre.monolito_infnethub.dto.VagaRequestDTO;
import com.andre.monolito_infnethub.dto.VagaResponseDTO;

import java.util.List;

/** Porta de serviço — Bounded Context: Oportunidades (SRP + DIP) */
public interface VagaService {

    List<VagaResponseDTO> listarAtivas();

    List<VagaResponseDTO> listarPorTipo(String tipo);

    VagaResponseDTO buscarPorId(Long id);

    VagaResponseDTO criar(VagaRequestDTO dto);

    VagaResponseDTO atualizar(Long id, VagaRequestDTO dto);

    void deletar(Long id);
}
