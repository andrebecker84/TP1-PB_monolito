package com.andre.monolito_infnethub.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Aggregate Root — Bounded Context: Identidade */
@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 100)
    private String escola;

    @Column(name = "ultimo_bloco", length = 50)
    private String ultimoBloco;

    @Column(length = 20)
    private String classe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Papel papel = Papel.ALUNO;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() { criadoEm = LocalDateTime.now(); }
}
