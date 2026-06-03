"use client";

import { useState } from "react";
import { ExternalLink, Building2, GraduationCap, Briefcase, Wrench } from "lucide-react";
import styles from "./RightPanel.module.css";

const ATENDIMENTO = [
  { label: "Secretaria Faculdade Infnet", icon: Building2,     href: "https://infnet.online/members/atendimento-infnet/"    },
  { label: "Secretaria ECDD",             icon: GraduationCap, href: "https://infnet.online/members/atendimento-ecdd/"      },
  { label: "Central de Carreiras",        icon: Briefcase,     href: "https://infnet.online/members/atendimento-carreiras/" },
  { label: "Suporte de TI",               icon: Wrench,        href: "https://infnet.online/members/atendimento-suporteti/" },
];

const GRUPOS = [
  { nome: "Engenharia de Softwares Escaláveis [26E2-26E3]", tipo: "Bloco", emoji: "⚙"  },
  { nome: "Design Patterns e DDD com Java [26E2-26E3]",     tipo: "Bloco", emoji: "🏗" },
  { nome: "Projeto de Bloco: Eng. Softwares Escaláveis",    tipo: "Bloco", emoji: "📦" },
  { nome: "Desenvolvimento Web com React [26E2-26E3]",       tipo: "Bloco", emoji: "⚛"  },
  { nome: "Desenvolvimento Mobile c/ React Native [26E2]",   tipo: "Bloco", emoji: "📱" },
  { nome: "Domain-Driven Design e Arquitetura Escalável",    tipo: "Bloco", emoji: "🎯" },
  { nome: "Avisos e novidades da graduação",                 tipo: "Geral", emoji: "📢" },
  { nome: "Histórias que inspiram",                         tipo: "Geral", emoji: "✨" },
  { nome: "Avisos e novidades para todos",                   tipo: "Geral", emoji: "🔔" },
  { nome: "Calouros — Ingresso 2026",                       tipo: "Geral", emoji: "🎓" },
  { nome: "Alumni Infnet — Rede de Egressos",               tipo: "Geral", emoji: "🤝" },
];

const GRUPOS_VISIVEIS = 6;

export default function RightPanel() {
  const [gruposExpand, setGruposExpand] = useState(false);
  const visibleGrupos = gruposExpand ? GRUPOS : GRUPOS.slice(0, GRUPOS_VISIVEIS);
  const hiddenCount   = GRUPOS.length - GRUPOS_VISIVEIS;

  return (
    <aside className={styles.panel}>

      {/* ── Atendimento ── */}
      <div className={styles.card}>
        <h3 className={styles.title}>Atendimento</h3>
        <p className={styles.desc}>Precisando de ajuda? Fale com a equipe correspondente.</p>
        {ATENDIMENTO.map(a => {
          const Icon = a.icon;
          return (
            <a key={a.href} href={a.href} target="_blank" rel="noopener noreferrer" className={styles.atendBtn}>
              <Icon size={15} className={styles.atendIco} />
              <span>{a.label}</span>
              <ExternalLink size={11} className={styles.extIco} />
            </a>
          );
        })}
      </div>

      {/* ── Meus Grupos ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.title}>Meus Grupos</h3>
          <button className={styles.verTodos} onClick={() => setGruposExpand(v => !v)}>
            {gruposExpand ? "Ver menos" : "Ver todos"}
          </button>
        </div>
        {visibleGrupos.map(g => (
          <div key={g.nome} className={styles.grupo}>
            <div className={styles.grupoIcon}>{g.emoji}</div>
            <div className={styles.grupoInfo}>
              <span className={styles.grupoNome}>{g.nome}</span>
              <span className={styles.grupoTipo}>{g.tipo}</span>
            </div>
          </div>
        ))}
        {!gruposExpand && hiddenCount > 0 && (
          <button className={styles.maisGrupos} onClick={() => setGruposExpand(true)}>
            +{hiddenCount} grupos — clique em ver todos
          </button>
        )}
      </div>

    </aside>
  );
}
