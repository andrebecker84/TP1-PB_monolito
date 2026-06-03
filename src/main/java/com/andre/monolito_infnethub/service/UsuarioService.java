package com.andre.monolito_infnethub.service;

import com.andre.monolito_infnethub.dto.UsuarioRequestDTO;
import com.andre.monolito_infnethub.dto.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponseDTO> listarTodos();

    UsuarioResponseDTO buscarPorId(Long id);

    UsuarioResponseDTO criar(UsuarioRequestDTO dto);

    UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO dto);

    void deletar(Long id);
}
