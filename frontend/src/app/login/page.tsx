"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Briefcase, LogIn } from "lucide-react";
import { usuarioService } from "@/services/usuarioService";
import { Usuario } from "@/types";
import { initials } from "@/utils/format";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usuarioService.listarTodos()
      .then(setUsuarios)
      .catch(() => setError("Não foi possível conectar ao servidor. Verifique se o back-end está rodando."))
      .finally(() => setLoading(false));
  }, []);

  const handleEntrar = () => {
    const user = usuarios.find(u => u.id === selected);
    if (!user) return;
    setEntrando(true);
    localStorage.setItem("infnet_user", JSON.stringify(user));
    router.push("/feed");
  };

  const CORES = ["#3b82f6", "#7c3aed", "#e63946", "#2a9d8f", "#f59e0b"];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandBg} />
          <div className={styles.brandOverlay} />
          <div className={styles.brandContent}>
            <div className={styles.brandGlass}>
              <div className={styles.logo}>
                <span className={styles.logoIcon}>⬡</span>
                <span className={styles.logoText}>INFNET HUB</span>
              </div>
              <p className={styles.tagline}>A plataforma dos estudantes Infnet!</p>
              <ul className={styles.features}>
                <li><LayoutDashboard size={16} className={styles.featureIcon} /> Feed de atualizações</li>
                <li><Users size={16} className={styles.featureIcon} /> Grupos e disciplinas</li>
                <li><Trophy size={16} className={styles.featureIcon} /> Trilhas de aprendizagem</li>
                <li><Briefcase size={16} className={styles.featureIcon} /> Vagas e oportunidades</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.form}>
          <h1 className={styles.title}>Bem-vindo(a) de volta!</h1>
          <p className={styles.subtitle}>Selecione seu perfil para continuar</p>

          {error && <div className={styles.error}>⚠️ {error}</div>}

          {loading ? (
            <div className={styles.loading}>
              {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.userList}>
              {usuarios.map(u => (
                <button
                  key={u.id}
                  className={`${styles.userCard} ${selected === u.id ? styles.userCardSelected : ""}`}
                  onClick={() => setSelected(u.id)}
                >
                  <div
                    className={styles.avatar}
                    style={{ background: CORES[u.id % CORES.length] }}
                  >
                    {initials(u.nome)}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{u.nome}</span>
                    <span className={styles.userMeta}>
                      {u.classe ? `${u.classe} · ` : ""}{u.escola ?? "Infnet"}
                    </span>
                  </div>
                  {selected === u.id && <span className={styles.check}>✓</span>}
                </button>
              ))}
            </div>
          )}

          <button
            className={styles.btnEntrar}
            onClick={handleEntrar}
            disabled={!selected || entrando}
          >
            {entrando ? "Entrando..." : <><LogIn size={18} /> Entrar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
