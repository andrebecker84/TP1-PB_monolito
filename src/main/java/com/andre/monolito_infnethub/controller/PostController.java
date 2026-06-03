package com.andre.monolito_infnethub.controller;

import com.andre.monolito_infnethub.dto.PostRequestDTO;
import com.andre.monolito_infnethub.dto.PostResponseDTO;
import com.andre.monolito_infnethub.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostResponseDTO>> listarTodos() {
        return ResponseEntity.ok(postService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(postService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PostResponseDTO> criar(@Valid @RequestBody PostRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PostRequestDTO dto) {
        return ResponseEntity.ok(postService.atualizar(id, dto));
    }

    @PostMapping("/{id}/curtir")
    public ResponseEntity<PostResponseDTO> curtir(@PathVariable Long id) {
        return ResponseEntity.ok(postService.curtir(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        postService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
