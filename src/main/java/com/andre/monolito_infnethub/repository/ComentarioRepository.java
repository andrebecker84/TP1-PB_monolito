package com.andre.monolito_infnethub.repository;

import com.andre.monolito_infnethub.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    @Query("SELECT c FROM Comentario c JOIN FETCH c.autor WHERE c.post.id = :postId ORDER BY c.criadoEm ASC")
    List<Comentario> findByPostId(Long postId);

    long countByPostId(Long postId);

    void deleteByPostId(Long postId);
}
