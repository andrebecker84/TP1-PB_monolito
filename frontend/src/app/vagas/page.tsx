"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Usuario, Vaga, VagaRequest } from "@/types";
import { vagaService } from "@/services/vagaService";
import AppLayout from "@/components/layout/AppLayout";
import RightPanel from "@/components/layout/RightPanel";
import VagaCard from "@/components/vagas/VagaCard";
import VagaForm from "@/components/vagas/VagaForm";
import styles from "./page.module.css";

function VagasContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVaga, setEditingVaga] = useState<Vaga | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("infnet_user");
    if (!stored) { router.push("/login"); return; }
    setCurrentUser(JSON.parse(stored));
    // lê query da URL no mount (deep link)
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q")?.toLowerCase().trim() ?? "");
    // escuta evento de busca do Header
    const handler = (e: Event) => setQuery((e as CustomEvent<{query:string}>).detail.query.toLowerCase().trim());
    window.addEventListener("infnet:search", handler);
    return () => window.removeEventListener("infnet:search", handler);
  }, [router]);

  const buscarVagas = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      setVagas(await vagaService.listarAtivas());
    } catch {
      setError("Não foi possível carregar as vagas. Verifique se o back-end está rodando.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (currentUser) buscarVagas(); }, [currentUser, buscarVagas]);

  const handleSalvar = async (dados: VagaRequest) => {
    setSalvando(true);
    try {
      if (editingVaga) {
        const atualizada = await vagaService.atualizar(editingVaga.id, dados);
        setVagas(prev => prev.map(v => v.id === editingVaga.id ? atualizada : v));
      } else {
        await vagaService.criar(dados);
        buscarVagas();
      }
      setShowForm(false); setEditingVaga(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar vaga");
    } finally { setSalvando(false); }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja remover esta vaga?")) return;
    try {
      await vagaService.deletar(id);
      setVagas(prev => prev.filter(v => v.id !== id));
    } catch (err) { alert(err instanceof Error ? err.message : "Erro ao remover"); }
  };

  const filteredVagas = query
    ? vagas.filter(v =>
        v.titulo.toLowerCase().includes(query) ||
        v.empresa.toLowerCase().includes(query) ||
        (v.categoria?.toLowerCase().includes(query) ?? false) ||
        (v.localizacao?.toLowerCase().includes(query) ?? false) ||
        (v.descricao?.toLowerCase().includes(query) ?? false)
      )
    : vagas;

  if (!currentUser) return null;

  return (
    <AppLayout currentUser={currentUser}>
      <div className={styles.body}>
        <main className={styles.main}>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Vagas &amp; Oportunidades</h1>
              <p className={styles.pageSubtitle}>
                Encontre estágios, empregos e oportunidades para a sua carreira
              </p>
            </div>
            <button
              className={styles.btnNova}
              onClick={() => { setEditingVaga(null); setShowForm(true); }}
            >
              <Plus size={16} /> Nova Vaga
            </button>
          </div>

          {error && (
            <div className={styles.error}>
              ⚠️ {error}
              <button onClick={buscarVagas}>Tentar novamente</button>
            </div>
          )}

          {query && (
            <div className={styles.searchBanner}>
              <span>Resultados para <strong>&quot;{query}&quot;</strong> — {filteredVagas.length} encontrada{filteredVagas.length !== 1 ? "s" : ""}</span>
              <button className={styles.clearSearch} onClick={() => { setQuery(""); router.push("/vagas"); }}><X size={13} /> Limpar</button>
            </div>
          )}

          {loading ? (
            <div className={styles.grid}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filteredVagas.length === 0 ? (
            <div className={styles.empty}>
              <span>💼</span>
              <p>{query ? `Nenhuma vaga encontrada para "${query}".` : "Nenhuma vaga disponível no momento."}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredVagas.map(vaga => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  currentUser={currentUser}
                  onEditar={() => { setEditingVaga(vaga); setShowForm(true); }}
                  onDeletar={() => handleDeletar(vaga.id)}
                />
              ))}
            </div>
          )}
        </main>

        <RightPanel />
      </div>

      {showForm && (
        <VagaForm
          vagaParaEditar={editingVaga}
          currentUser={currentUser}
          salvando={salvando}
          onSalvar={handleSalvar}
          onCancelar={() => { setShowForm(false); setEditingVaga(null); }}
        />
      )}
    </AppLayout>
  );
}

export default function VagasPage() {
  return (
    <Suspense>
      <VagasContent />
    </Suspense>
  );
}
