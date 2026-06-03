"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Inbox, X } from "lucide-react";
import { Usuario, Post, PostRequest } from "@/types";
import { postService } from "@/services/postService";
import AppLayout from "@/components/layout/AppLayout";
import LeftPanel from "@/components/layout/LeftPanel";
import RightPanel from "@/components/layout/RightPanel";
import PostCard from "@/components/feed/PostCard";
import PostForm from "@/components/feed/PostForm";
import styles from "./page.module.css";

function FeedContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [enviando, setEnviando] = useState(false);

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

  const buscarPosts = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      setPosts(await postService.listarTodos());
    } catch {
      setError("Não foi possível carregar o feed. Verifique se o back-end está rodando.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (currentUser) buscarPosts(); }, [currentUser, buscarPosts]);

  const handleSalvar = async (dados: PostRequest) => {
    setEnviando(true);
    try {
      if (editingPost) {
        const atualizado = await postService.atualizar(editingPost.id, dados);
        setPosts(prev => prev.map(p => p.id === editingPost.id ? atualizado : p));
      } else {
        await postService.criar(dados);
        buscarPosts();
      }
      setShowForm(false); setEditingPost(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar publicação");
    } finally { setEnviando(false); }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja remover esta publicação?")) return;
    try {
      await postService.deletar(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert(err instanceof Error ? err.message : "Erro ao remover"); }
  };

  const filteredPosts = query
    ? posts.filter(p =>
        p.conteudo.toLowerCase().includes(query) ||
        (p.titulo?.toLowerCase().includes(query) ?? false) ||
        p.autorNome.toLowerCase().includes(query)
      )
    : posts;

  if (!currentUser) return null;

  return (
    <AppLayout currentUser={currentUser}>
      <div className={styles.body}>

        <LeftPanel />

        <main className={styles.feed}>
          {!showForm ? (
            <div className={styles.composeBox} onClick={() => { setEditingPost(null); setShowForm(true); }}>
              <div className={styles.composeAv}>
                {currentUser.nome.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase()}
              </div>
              <div className={styles.composePlaceholder}>
                O que você está pensando, {currentUser.nome.split(" ")[0]}?
              </div>
              <button className={styles.btnPublicar}>Publicar</button>
            </div>
          ) : (
            <PostForm
              currentUser={currentUser}
              postParaEditar={editingPost}
              enviando={enviando}
              onPostar={handleSalvar}
              onCancelar={() => { setShowForm(false); setEditingPost(null); }}
            />
          )}

          {error && (
            <div className={styles.error}>
              ⚠️ {error}
              <button onClick={buscarPosts}>Tentar novamente</button>
            </div>
          )}

          {query && (
            <div className={styles.searchBanner}>
              <span>Resultados para <strong>"{query}"</strong> — {filteredPosts.length} encontrado{filteredPosts.length !== 1 ? "s" : ""}</span>
              <button className={styles.clearSearch} onClick={() => { setQuery(""); router.push("/feed"); }}><X size={13} /> Limpar</button>
            </div>
          )}

          {loading ? (
            <div className={styles.skeletons}>
              {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.empty}>
              <Inbox size={48} className={styles.emptyIcon} />
              <p>{query ? `Nenhum resultado para "${query}".` : "Nenhuma publicação ainda. Seja o primeiro!"}</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onEditar={() => { setEditingPost(post); setShowForm(true); }}
                onDeletar={() => handleDeletar(post.id)}
                onPostUpdated={updated => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
              />
            ))
          )}
        </main>

        <RightPanel />
      </div>
    </AppLayout>
  );
}

export default function FeedPage() {
  return (
    <Suspense>
      <FeedContent />
    </Suspense>
  );
}
