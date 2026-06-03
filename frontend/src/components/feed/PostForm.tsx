"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { X, Image, Paperclip, Smile, Code2, Send } from "lucide-react";
import { Usuario, Post, PostRequest } from "@/types";
import { initials, EMOJIS } from "@/utils/format";
import { CORES } from "@/utils/colors";
import styles from "./PostForm.module.css";

interface Props {
  currentUser: Usuario;
  postParaEditar: Post | null;
  enviando: boolean;
  onPostar: (dados: PostRequest) => void;
  onCancelar: () => void;
}

export default function PostForm({ currentUser, postParaEditar, enviando, onPostar, onCancelar }: Props) {
  const [titulo,    setTitulo]    = useState("");
  const [conteudo,  setConteudo]  = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef    = useRef<HTMLDivElement>(null);

  const cor    = CORES[currentUser.id % CORES.length];
  const isEdit = !!postParaEditar;

  useEffect(() => {
    setTitulo(postParaEditar?.titulo ?? "");
    setConteudo(postParaEditar?.conteudo ?? "");
  }, [postParaEditar]);

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
    setConteudo(v => v.slice(0, start) + text + v.slice(start));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus(); }, 0);
  };

  const handleCodeWrap = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    if (s !== e) {
      setConteudo(v => v.slice(0, s) + "`" + v.slice(s, e) + "`" + v.slice(e));
      setTimeout(() => { ta.selectionStart = s + 1; ta.selectionEnd = e + 1; ta.focus(); }, 0);
    } else {
      setConteudo(v => v.slice(0, s) + "``" + v.slice(s));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 1; ta.focus(); }, 0);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim()) return;
    onPostar({ titulo: titulo.trim() || undefined, conteudo: conteudo.trim(), autorId: currentUser.id });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar} style={{ background: cor }}>{initials(currentUser.nome)}</div>
        <div className={styles.info}>
          <span className={styles.name}>{currentUser.nome}</span>
          <span className={styles.sub}>{isEdit ? "Editando publicação" : "Publicar para todos"}</span>
        </div>
        <button className={styles.closeBtn} onClick={onCancelar} disabled={enviando}>
          <X size={16} />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.tituloInput}
          placeholder="Título (opcional)"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          maxLength={200}
          disabled={enviando}
        />

        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.conteudo}
            placeholder="O que você está pensando?"
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            rows={4}
            required
            disabled={enviando}
            autoFocus
          />

          <div className={styles.toolbar}>
            <div className={styles.tools}>
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

            <span className={styles.chars}>{conteudo.length} caracteres</span>

            <div className={styles.toolActions}>
              <button type="button" className={styles.btnCancelar} onClick={onCancelar} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnEnviar} disabled={!conteudo.trim() || enviando}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
