package com.andre.monolito_infnethub.controller;

import com.andre.monolito_infnethub.dto.CurtidaResponseDTO;
import com.andre.monolito_infnethub.model.Curtida;
import com.andre.monolito_infnethub.model.Post;
import com.andre.monolito_infnethub.model.Usuario;
import com.andre.monolito_infnethub.repository.CurtidaRepository;
import com.andre.monolito_infnethub.repository.PostRepository;
import com.andre.monolito_infnethub.repository.UsuarioRepository;
import com.andre.monolito_infnethub.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/posts/{postId}/curtidas")
@RequiredArgsConstructor
public class CurtidaController {

    private final CurtidaRepository curtidaRepository;
    private final PostRepository postRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<CurtidaResponseDTO>> listar(@PathVariable Long postId) {
        return ResponseEntity.ok(
                curtidaRepository.findByPostId(postId)
                        .stream().map(CurtidaResponseDTO::fromEntity).toList()
        );
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> curtirOuDescurtir(
            @PathVariable Long postId,
            @RequestParam Long usuarioId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post não encontrado: " + postId));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + usuarioId));

        Optional<Curtida> existente = curtidaRepository.findByPostIdAndUsuarioId(postId, usuarioId);

        boolean curtido;
        if (existente.isPresent()) {
            curtidaRepository.delete(existente.get());
            curtido = false;
        } else {
            curtidaRepository.save(Curtida.builder().post(post).usuario(usuario).build());
            curtido = true;
        }

        long total = curtidaRepository.countByPostId(postId);
        return ResponseEntity.ok(Map.of("curtido", curtido, "total", total));
    }
}
