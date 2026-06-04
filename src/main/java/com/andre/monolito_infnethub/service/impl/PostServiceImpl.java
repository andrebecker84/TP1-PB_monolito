package com.andre.monolito_infnethub.service.impl;

import com.andre.monolito_infnethub.dto.PostRequestDTO;
import com.andre.monolito_infnethub.dto.PostResponseDTO;
import com.andre.monolito_infnethub.exception.ResourceNotFoundException;
import com.andre.monolito_infnethub.model.Post;
import com.andre.monolito_infnethub.model.Usuario;
import com.andre.monolito_infnethub.repository.ComentarioRepository;
import com.andre.monolito_infnethub.repository.CurtidaRepository;
import com.andre.monolito_infnethub.repository.PostRepository;
import com.andre.monolito_infnethub.repository.UsuarioRepository;
import com.andre.monolito_infnethub.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository       postRepository;
    private final UsuarioRepository    usuarioRepository;
    private final ComentarioRepository comentarioRepository;
    private final CurtidaRepository    curtidaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> listarTodos() {
        return postRepository.findAllWithAutorOrderByDataDesc()
                .stream()
                .map(p -> PostResponseDTO.fromEntity(p, comentarioRepository.countByPostId(p.getId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponseDTO buscarPorId(Long id) {
        Post post = postRepository.findByIdWithAutor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post não encontrado com id: " + id));
        return PostResponseDTO.fromEntity(post, comentarioRepository.countByPostId(id));
    }

    @Override
    @Transactional
    public PostResponseDTO criar(PostRequestDTO dto) {
        Usuario autor = usuarioRepository.findById(dto.autorId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + dto.autorId()));

        Post post = Post.builder()
                .titulo(dto.titulo())
                .conteudo(dto.conteudo())
                .autor(autor)
                .curtidas(0)
                .build();

        Post saved = postRepository.save(post);
        return PostResponseDTO.fromEntity(saved, 0L);
    }

    @Override
    @Transactional
    public PostResponseDTO atualizar(Long id, PostRequestDTO dto) {
        Post post = postRepository.findByIdWithAutor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post não encontrado com id: " + id));
        post.setTitulo(dto.titulo());
        post.setConteudo(dto.conteudo());
        return PostResponseDTO.fromEntity(postRepository.save(post), comentarioRepository.countByPostId(id));
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Post não encontrado com id: " + id);
        }
        curtidaRepository.deleteByPostId(id);
        comentarioRepository.deleteByPostId(id);
        postRepository.deleteById(id);
    }

    @Override
    @Transactional
    public PostResponseDTO curtir(Long id) {
        Post post = postRepository.findByIdWithAutor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post não encontrado com id: " + id));
        post.setCurtidas(post.getCurtidas() + 1);
        return PostResponseDTO.fromEntity(postRepository.save(post), comentarioRepository.countByPostId(id));
    }
}
