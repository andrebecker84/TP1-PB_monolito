package com.andre.monolito_infnethub.service;

import com.andre.monolito_infnethub.dto.PostRequestDTO;
import com.andre.monolito_infnethub.dto.PostResponseDTO;

import java.util.List;

public interface PostService {

    List<PostResponseDTO> listarTodos();

    PostResponseDTO buscarPorId(Long id);

    PostResponseDTO criar(PostRequestDTO dto);

    void deletar(Long id);

    PostResponseDTO atualizar(Long id, PostRequestDTO dto);

    PostResponseDTO curtir(Long id);
}
