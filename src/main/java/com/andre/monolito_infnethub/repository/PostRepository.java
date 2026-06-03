package com.andre.monolito_infnethub.repository;

import com.andre.monolito_infnethub.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p JOIN FETCH p.autor ORDER BY p.criadoEm DESC")
    List<Post> findAllWithAutorOrderByDataDesc();

    @Query("SELECT p FROM Post p JOIN FETCH p.autor WHERE p.id = :id")
    Optional<Post> findByIdWithAutor(Long id);

    @Query("SELECT p FROM Post p JOIN FETCH p.autor WHERE p.autor.id = :autorId ORDER BY p.criadoEm DESC")
    List<Post> findByAutorId(Long autorId);
}
