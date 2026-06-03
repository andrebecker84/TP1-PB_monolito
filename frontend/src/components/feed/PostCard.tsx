"use client";

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { ThumbsUp, MessageCircle, Pencil, X, ChevronDown, ChevronUp, Send, Image, Paperclip, Smile, Code2 } from "lucide-react";
import { Post, Usuario, Comentario } from "@/types";
import { postService } from "@/services/postService";
import { showToast } from "@/utils/toast";
import { initials, relativo, EMOJIS } from "@/utils/format";
import { CORES, PAPEL_BG, PAPEL_TXT } from "@/utils/colors";
import styles from "./PostCard.module.css";

interface Props {
  post: Post;
  currentUser: Usuario;
  onEditar: () => void;
  onDeletar: () => void;
  onPostUpdated: (p: Post) => void;
}

const CHARS_LIMIT = 320;
const LINES_LIMIT = 5;

function renderWithCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2
      ? <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>
      : <span key={i}>{part}</span>
  );
}

export default function PostCard({ post, currentUser, onEditar, onDeletar, onPostUpdated }: Props) {
  const cor      = CORES[post.autorId % CORES.length];
  const isAuthor = post.autorId === currentUser.id;
  const isLong   = post.conteudo.length > CHARS_LIMIT || post.conteudo.split("\n").length > LINES_LIMIT;

  const [expandido,      setExpandido]     = useState(false);
  const [totalCurtidas,  setTotal]         = useState(post.curtidas);
  const [curtidoPorMim,  setCurtidoPorMim] = useState(false);
  const [quemCurtiu,     setQuemCurtiu]    = useState<{ usuarioId: number; usuarioNome: string }[]>([]);
  const [showQuem,       setShowQuem]      = useState(false);
  const [curtindo,       setCurtindo]      = useState(false);
  const [showComents,    setShowComents]   = useState(false);
  const [comentarios,    setComentarios]   = useState<Comentario[]>([]);
  const [loadingComents, setLoadingC]      = useState(false);
  const [novoComent,     setNovoComent]    = useState("");
  const [enviandoC,      setEnviandoC]     = useState(false);
  const [editingCId,     setEditingCId]    = useState<number | null>(null);
  const [editText,       setEditText]      = useState("");
  const [showEmoji,      setShowEmoji]     = useState(false);
  const [showAll,        setShowAll]       = useState(false);
  const [listCollapsed,  setListCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    setNovoComent(v => v.slice(0, start) + text + v.slice(start));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus(); }, 0);
  };

  const handleCodeWrap = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    if (s !== e) {
      setNovoComent(v => v.slice(0, s) + "`" + v.slice(s, e) + "`" + v.slice(e));
      setTimeout(() => { ta.selectionStart = s + 1; ta.selectionEnd = e + 1; ta.focus(); }, 0);
    } else {
      setNovoComent(v => v.slice(0, s) + "``" + v.slice(s));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 1; ta.focus(); }, 0);
    }
  };

  useEffect(() => {
    postService.listarCurtidas(post.id).then(lista => {
      setQuemCurtiu(lista);
      setTotal(lista.length);
      setCurtidoPorMim(lista.some(c => c.usuarioId === currentUser.id));
    }).catch(() => {});

    postService.listarComentarios(post.id).then(setComentarios).catch(() => {});
  }, [post.id, currentUser.id]);

  const handleToggleCurtir = async () => {
    if (curtindo) return;
    setCurtindo(true);
    const era = curtidoPorMim;
    setCurtidoPorMim(!era);
    setTotal(v => era ? v - 1 : v + 1);
    try {
      const res = await postService.toggleCurtir(post.id, currentUser.id);
      setCurtidoPorMim(res.curtido);
      setTotal(Number(res.total));
      const lista = await postService.listarCurtidas(post.id);
      setQuemCurtiu(lista);
      onPostUpdated({ ...post, curtidas: Number(res.total) });
      showToast(res.curtido ? "Publicação curtida!" : "Curtida removida", res.curtido ? "success" : "info");
    } catch {
      setCurtidoPorMim(era);
      setTotal(v => era ? v + 1 : v - 1);
      showToast("Erro ao curtir. Tente novamente.", "error");
    } finally { setCurtindo(false); }
  };

  const toggleComentarios = () => {
    const opening = !showComents;
    setShowComents(opening);
    if (opening) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        textareaRef.current?.focus();
      }, 80);
    }
  };

  const handleEnviarComent = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!novoComent.trim() || enviandoC) return;
    setEnviandoC(true);
    try {
      const novo = await postService.criarComentario(post.id, novoComent.trim(), currentUser.id);
      setComentarios(prev => [...prev, novo]);
      setNovoComent("");
      showToast("Comentário publicado!", "success");
    } catch {
      showToast("Erro ao publicar comentário.", "error");
    } finally { setEnviandoC(false); }
  };

  const handleCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviarComent();
    }
  };

  const handleSalvarEdit = async (c: Comentario) => {
    if (!editText.trim()) return;
    const upd = await postService.editarComentario(post.id, c.id, editText.trim(), currentUser.id).catch(() => null);
    if (upd) {
      setComentarios(prev => prev.map(x => x.id === c.id ? upd : x));
      setEditingCId(null);
      showToast("Comentário atualizado.", "info");
    }
  };

  const handleDeletarComent = async (id: number) => {
    if (!confirm("Remover comentário?")) return;
    await postService.deletarComentario(post.id, id).catch(() => {});
    setComentarios(prev => prev.filter(c => c.id !== id));
    showToast("Comentário removido.", "info");
  };

  return (
    <article className={styles.card}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.avatar} style={{ background: cor }}>{initials(post.autorNome)}</div>
        <div className={styles.meta}>
          <div className={styles.authorLine}>
            <span className={styles.autor}>{post.autorNome}</span>
            <span
              className={styles.papel}
              style={{ background: PAPEL_BG[post.autorPapel], color: PAPEL_TXT[post.autorPapel] }}
            >
              {post.autorPapelDescricao}
            </span>
          </div>
          <span className={styles.tempo}>{relativo(post.criadoEm)}</span>
        </div>
        {isAuthor && (
          <div className={styles.actions}>
            <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={onEditar} title="Editar">
              <Pencil size={14} />
            </button>
            <button className={`${styles.iconBtn} ${styles.delBtn}`} onClick={onDeletar} title="Remover">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Conteúdo ── */}
      <div className={styles.body}>
        {post.titulo && <h3 className={styles.titulo}>{post.titulo}</h3>}
        <p className={`${styles.conteudo} ${isLong && !expandido ? styles.truncated : ""}`}>
          {renderWithCode(post.conteudo)}
        </p>
        {isLong && (
          <button className={styles.lerMais} onClick={() => setExpandido(v => !v)}>
            {expandido ? <><ChevronUp size={13} /> Ver menos</> : <><ChevronDown size={13} /> Ler mais</>}
          </button>
        )}
      </div>

      {/* ── Quem curtiu ── */}
      {totalCurtidas > 0 && (
        <div className={styles.curtidasBar}>
          <button className={styles.curtidasTxt} onClick={() => setShowQuem(v => !v)}>
            <ThumbsUp size={12} /> {totalCurtidas} curtida{totalCurtidas !== 1 ? "s" : ""}
            {showQuem ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showQuem && (
            <div className={styles.quemList}>
              {quemCurtiu.map(c => (
                <span key={c.usuarioId} className={styles.quemChip}>
                  <span className={styles.quemAv} style={{ background: CORES[c.usuarioId % CORES.length] }}>
                    {initials(c.usuarioNome)}
                  </span>
                  {c.usuarioNome}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Botões de ação ── */}
      <div className={styles.footer}>
        <button
          className={`${styles.actionBtn} ${curtidoPorMim ? styles.liked : ""}`}
          onClick={handleToggleCurtir}
          disabled={curtindo}
        >
          <ThumbsUp size={15} fill={curtidoPorMim ? "currentColor" : "none"} />
          {curtidoPorMim ? "Curtido" : "Curtir"}
        </button>
        <button
          className={`${styles.actionBtn} ${showComents ? styles.commentActive : ""}`}
          onClick={toggleComentarios}
        >
          <MessageCircle size={15} />
          Comentar
          {(post.totalComentarios > 0 || comentarios.length > 0) && (
            <span className={styles.cntBadge}>{comentarios.length || post.totalComentarios}</span>
          )}
        </button>
      </div>

      {/* ── Comentários ── */}
      {(comentarios.length > 0 || showComents) && (
        <div className={styles.comentSection}>
          <div className={styles.comentHeader}>
            <MessageCircle size={13} /> Comentários{comentarios.length > 0 ? ` (${comentarios.length})` : ""}
            {comentarios.length > 0 && (
              <button className={styles.toggleComents} onClick={() => setListCollapsed(v => !v)}>
                {listCollapsed ? <><ChevronDown size={12} /> Revelar</> : <><ChevronUp size={12} /> Ocultar</>}
              </button>
            )}
          </div>

          {!listCollapsed && loadingComents && (
            <p className={styles.info}>Carregando...</p>
          )}
          {!listCollapsed && !loadingComents && comentarios.length === 0 && (
            <p className={styles.info}>Nenhum comentário ainda.</p>
          )}
          {!listCollapsed && !loadingComents && comentarios.length > 0 && (
            <div className={styles.comentList}>
              {(showAll ? comentarios : comentarios.slice(0, 5)).map(c => (
                <div key={c.id} className={styles.comentItem}>
                  <div className={styles.cAv} style={{ background: CORES[c.autorId % CORES.length] }}>
                    {initials(c.autorNome)}
                  </div>
                  <div className={styles.cBody}>
                    <div className={styles.cMeta}>
                      <span className={styles.cAutor}>{c.autorNome}</span>
                      {c.autorPapel && (
                        <span className={styles.cPapel} style={{ background: PAPEL_BG[c.autorPapel], color: PAPEL_TXT[c.autorPapel] }}>
                          {c.autorPapelDescricao}
                        </span>
                      )}
                      <span className={styles.cTempo}>{relativo(c.criadoEm)}</span>
                      {c.autorId === currentUser.id && editingCId !== c.id && (
                        <div className={styles.cActions}>
                          <button className={styles.cIconBtn} onClick={() => { setEditingCId(c.id); setEditText(c.conteudo); }}>
                            <Pencil size={11} />
                          </button>
                          <button className={`${styles.cIconBtn} ${styles.cDel}`} onClick={() => handleDeletarComent(c.id)}>
                            <X size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCId === c.id ? (
                      <div className={styles.editRow}>
                        <input className={styles.editInput} value={editText} onChange={e => setEditText(e.target.value)} autoFocus />
                        <button className={styles.btnSave} onClick={() => handleSalvarEdit(c)}>Salvar</button>
                        <button className={styles.btnCnl} onClick={() => setEditingCId(null)}><X size={12} /></button>
                      </div>
                    ) : (
                      <p className={styles.cText}>{renderWithCode(c.conteudo)}</p>
                    )}
                  </div>
                </div>
              ))}
              {!showAll && comentarios.length > 5 && (
                <button className={styles.verMais} onClick={() => setShowAll(true)}>
                  <ChevronDown size={14} /> Ver mais {comentarios.length - 5} comentário{comentarios.length - 5 !== 1 ? "s" : ""}
                </button>
              )}
              {showAll && comentarios.length > 5 && (
                <button className={styles.verMais} onClick={() => setShowAll(false)}>
                  <ChevronUp size={14} /> Ver menos
                </button>
              )}
            </div>
          )}

          {/* ── Barra de novo comentário ── */}
          {showComents && (
            <div className={styles.novoComentArea}>
              <div className={styles.cAv} style={{ background: CORES[currentUser.id % CORES.length] }}>
                {initials(currentUser.nome)}
              </div>
              <div className={styles.novoComentBox}>
                <textarea
                  ref={textareaRef}
                  className={styles.novoInput}
                  placeholder="Escreva um comentário..."
                  value={novoComent}
                  onChange={e => setNovoComent(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  disabled={enviandoC}
                  rows={2}
                />
                <div className={styles.novoToolbar}>
                  <div className={styles.novoTools}>
                    <button className={styles.toolBtn} type="button" title="Anexar imagem"><Image size={14} /></button>
                    <button className={styles.toolBtn} type="button" title="Anexar documento"><Paperclip size={14} /></button>
                    <div ref={emojiRef} className={styles.emojiWrap}>
                      <button className={styles.toolBtn} type="button" title="Emoji" onClick={() => setShowEmoji(v => !v)}>
                        <Smile size={14} />
                      </button>
                      {showEmoji && (
                        <div className={styles.emojiPicker}>
                          {EMOJIS.map(e => (
                            <button key={e} className={styles.emojiBtn} type="button"
                              onClick={() => { insertAtCursor(e); setShowEmoji(false); }}>
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className={styles.toolBtn} type="button" title="Formatar código" onClick={handleCodeWrap}>
                      <Code2 size={14} />
                    </button>
                  </div>
                  <div className={styles.novoHints}>
                    <span><kbd>Enter</kbd> enviar</span>
                    <span><kbd>Shift+Enter</kbd> nova linha</span>
                  </div>
                  <button
                    className={styles.btnEnviar}
                    type="button"
                    disabled={!novoComent.trim() || enviandoC}
                    onClick={() => handleEnviarComent()}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </article>
  );
}
