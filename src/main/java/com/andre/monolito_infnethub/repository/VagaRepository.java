package com.andre.monolito_infnethub.repository;

import com.andre.monolito_infnethub.model.TipoVaga;
import com.andre.monolito_infnethub.model.Vaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VagaRepository extends JpaRepository<Vaga, Long> {

    @Query("SELECT v FROM Vaga v JOIN FETCH v.criador WHERE v.ativo = true ORDER BY v.criadoEm DESC")
    List<Vaga> findAllAtivasWithCriador();

    @Query("SELECT v FROM Vaga v JOIN FETCH v.criador WHERE v.id = :id")
    Optional<Vaga> findByIdWithCriador(Long id);

    @Query("SELECT v FROM Vaga v JOIN FETCH v.criador WHERE v.tipo = :tipo AND v.ativo = true ORDER BY v.criadoEm DESC")
    List<Vaga> findByTipoWithCriador(TipoVaga tipo);
}
