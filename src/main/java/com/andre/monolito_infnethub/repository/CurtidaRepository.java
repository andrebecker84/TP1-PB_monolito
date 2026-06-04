package com.andre.monolito_infnethub.repository;

import com.andre.monolito_infnethub.model.Curtida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurtidaRepository extends JpaRepository<Curtida, Long> {

    Optional<Curtida> findByPostIdAndUsuarioId(Long postId, Long usuarioId);

    boolean existsByPostIdAndUsuarioId(Long postId, Long usuarioId);

    @Query("SELECT c FROM Curtida c JOIN FETCH c.usuario WHERE c.post.id = :postId")
    List<Curtida> findByPostId(Long postId);

    long countByPostId(Long postId);

    void deleteByPostId(Long postId);
}
