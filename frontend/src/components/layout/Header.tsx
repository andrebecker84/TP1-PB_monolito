"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Hexagon,
  Search, Bell, MessageSquare, ChevronDown, LogOut,
  LayoutDashboard, Users, Trophy, Briefcase,
  User, Settings, ImageIcon,
  ThumbsUp, MessageCircle, UserPlus, Construction,
  Sun, Moon, FileText, X,
} from "lucide-react";
import { Usuario } from "@/types";
import { signOut } from "@/hooks/useCurrentUser";
import { initials } from "@/utils/format";
import { CORES } from "@/utils/colors";
import styles from "./Header.module.css";

interface Props {
  currentUser: Usuario;
  sidebarExpanded: boolean;
}

const NAV = [
  { label: "Feed",    href: "/feed",  icon: LayoutDashboard },
  { label: "Grupos",  href: "/feed",  icon: Users           },
  { label: "Trilhas", href: "/feed",  icon: Trophy          },
  { label: "Vagas",   href: "/vagas", icon: Briefcase       },
];

const MENU_ITEMS = [
  { label: "Perfil",        icon: User        },
  { label: "Grupos",        icon: Users       },
  { label: "Trilhas",       icon: Trophy      },
  { label: "Fotos",         icon: ImageIcon   },
  { label: "Configurações", icon: Settings    },
];

const NOTIFICATIONS = [
  { id: 1, icon: ThumbsUp,      text: 'Lucas Mendonça curtiu sua publicação "Bem-vindos ao Infnet Hub!"', time: '2 min',  unread: true  },
  { id: 2, icon: MessageCircle, text: 'Prof. Carlos Oliveira comentou em seu post',                        time: '15 min', unread: true  },
  { id: 3, icon: UserPlus,      text: 'Você foi adicionado ao grupo "Eng. de Softwares Escaláveis"',       time: '1h',     unread: false },
];

const MESSAGES = [
  { id: 1, nome: 'Lucas Mendonça',       texto: 'Oi, como vai o TP?',                      time: '5 min', unread: true  },
  { id: 2, nome: 'Prof. Carlos Oliveira', texto: 'Revise o design pattern do seu TP1...', time: '2h',    unread: false },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export default function Header({ currentUser, sidebarExpanded }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [msgOpen,       setMsgOpen]       = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [theme,         setTheme]         = useState<"dark" | "light">("dark");
  const [searchValue,   setSearchValue]   = useState("");
  const [suggestions,   setSuggestions]   = useState<{ category: string; label: string; sub: string; href: string }[]>([]);
  const [showSugg,      setShowSugg]      = useState(false);

  const menuRef   = useRef<HTMLDivElement>(null);
  const notifRef  = useRef<HTMLDivElement>(null);
  const msgRef    = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggRef   = useRef<HTMLDivElement>(null);

  const cor        = CORES[currentUser.id % CORES.length];
  const myInitials = initials(currentUser.nome);
  const unreadNotif = NOTIFICATIONS.filter(n => n.unread).length;
  const unreadMsg   = MESSAGES.filter(m => m.unread).length;

  useEffect(() => {
    const saved = localStorage.getItem("infnet-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggRef.current && !suggRef.current.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current  && !menuRef.current.contains(e.target  as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (msgRef.current   && !msgRef.current.contains(e.target   as Node)) setMsgOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchRef.current?.blur();
        setMenuOpen(false); setNotifOpen(false); setMsgOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const q = searchValue.trim().toLowerCase();
    if (q.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    const timer = setTimeout(async () => {
      try {
        const [postsRes, vagasRes] = await Promise.all([
          fetch(`${API}/posts`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`${API}/vagas`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]);
        const results: typeof suggestions = [];
        (postsRes as { id: number; titulo: string | null; conteudo: string; autorNome: string }[])
          .filter(p =>
            (p.titulo ?? "").toLowerCase().includes(q) ||
            p.conteudo.toLowerCase().includes(q) ||
            p.autorNome.toLowerCase().includes(q)
          )
          .slice(0, 4)
          .forEach(p => results.push({
            category: "Posts",
            label: p.titulo ?? p.conteudo.slice(0, 50),
            sub: p.autorNome,
            href: `/feed?q=${encodeURIComponent(q)}`,
          }));
        (vagasRes as { id: number; titulo: string; empresa: string; categoria: string | null; localizacao: string | null }[])
          .filter(v =>
            v.titulo.toLowerCase().includes(q) ||
            v.empresa.toLowerCase().includes(q) ||
            (v.categoria ?? "").toLowerCase().includes(q) ||
            (v.localizacao ?? "").toLowerCase().includes(q)
          )
          .slice(0, 4)
          .forEach(v => results.push({
            category: "Vagas",
            label: v.titulo,
            sub: v.empresa,
            href: `/vagas?q=${encodeURIComponent(q)}`,
          }));
        setSuggestions(results);
        setShowSugg(results.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchNav = (href?: string) => {
    const q = searchValue.trim();
    setShowSugg(false);
    setSearchValue("");
    const target = href ?? `/feed?q=${encodeURIComponent(q)}`;
    window.dispatchEvent(new CustomEvent("infnet:search", { detail: { query: q } }));
    router.push(target);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("infnet-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ── Esquerda: logo (fade out quando sidebar expande) ── */}
        <div className={styles.left}>
          <div
            className={`${styles.logo} ${sidebarExpanded ? styles.logoHidden : ""}`}
            onClick={() => router.push("/feed")}
          >
            <Hexagon size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>INFNET HUB</span>
          </div>
        </div>

        {/* ── Centro: navegação principal ── */}
        <nav className={styles.nav}>
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href && (label === "Feed" || label === "Vagas");
            return (
              <button
                key={label}
                className={`${styles.navItem} ${active ? styles.navActive : ""}`}
                onClick={() => router.push(href)}
              >
                <Icon size={15} />{label}
              </button>
            );
          })}
        </nav>

        {/* ── Direita: busca + ícones ── */}
        <div className={styles.right}>

          {/* Busca */}
          <div ref={suggRef} className={`${styles.searchWrap} ${searchFocused ? styles.searchFocused : ""}`}>
            <Search size={14} className={styles.searchIcon} />
            <input
              ref={searchRef}
              className={styles.searchInput}
              placeholder="Buscar..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => { setSearchFocused(true); if (suggestions.length > 0) setShowSugg(true); }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={e => {
                if (e.key === "Enter") { handleSearchNav(); searchRef.current?.blur(); }
                if (e.key === "Escape") { setShowSugg(false); setSearchValue(""); searchRef.current?.blur(); }
              }}
            />
            {searchValue ? (
              <button className={styles.searchClear} onClick={() => { setSearchValue(""); setShowSugg(false); searchRef.current?.focus(); }}>
                <X size={12} />
              </button>
            ) : (
              <span className={styles.searchKbd}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <kbd>⌘</kbd><kbd>K</kbd>
                <span className={styles.kbdSep}>|</span>
                <svg width="11" height="11" viewBox="0 0 88 88" fill="currentColor"><path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.017 34.453L.001 75.48V45.7zm4.326-38.025L87.314 0v41.527l-47.318.376zm47.329 41.123l-.011 41.343-47.318-6.678-.066-34.739z"/></svg>
                <kbd>Ctrl</kbd><kbd>K</kbd>
              </span>
            )}

            {showSugg && suggestions.length > 0 && (
              <div className={styles.suggBox}>
                {["Posts", "Vagas"].map(cat => {
                  const items = suggestions.filter(s => s.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <div className={styles.suggCat}>
                        {cat === "Posts" ? <FileText size={11} /> : <Briefcase size={11} />} {cat}
                      </div>
                      {items.map((s, i) => (
                        <button key={i} className={styles.suggItem} onMouseDown={() => handleSearchNav(s.href)}>
                          <span className={styles.suggLabel}>{s.label}</span>
                          <span className={styles.suggSub}>{s.sub}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mensagens */}
          <div ref={msgRef} className={styles.popWrap}>
            <button
              className={styles.iconBtn}
              title="Mensagens"
              onClick={() => { setMsgOpen(v => !v); setNotifOpen(false); setMenuOpen(false); }}
            >
              <MessageSquare size={18} />
              {unreadMsg > 0 && <span className={styles.badge}>{unreadMsg}</span>}
            </button>

            {msgOpen && (
              <div className={styles.popup}>
                <div className={styles.popHeader}>
                  <span className={styles.popTitle}>Mensagens</span>
                  <button className={styles.popAction}>Nova mensagem</button>
                </div>
                {MESSAGES.map(m => {
                  const msgCor = CORES[m.id % CORES.length];
                  return (
                    <div key={m.id} className={`${styles.msgItem} ${m.unread ? styles.unread : ""}`}>
                      <div className={styles.msgAv} style={{ background: msgCor }}>{initials(m.nome)}</div>
                      <div className={styles.msgBody}>
                        <span className={styles.msgNome}>{m.nome}</span>
                        <span className={styles.msgTexto}>{m.texto}</span>
                      </div>
                      <span className={styles.msgTime}>{m.time}</span>
                    </div>
                  );
                })}
                <div className={styles.popConstruct}>
                  <Construction size={13} /> Em construção
                </div>
              </div>
            )}
          </div>

          {/* Notificações */}
          <div ref={notifRef} className={styles.popWrap}>
            <button
              className={styles.iconBtn}
              title="Notificações"
              onClick={() => { setNotifOpen(v => !v); setMsgOpen(false); setMenuOpen(false); }}
            >
              <Bell size={18} />
              {unreadNotif > 0 && <span className={styles.badge}>{unreadNotif}</span>}
            </button>

            {notifOpen && (
              <div className={styles.popup}>
                <div className={styles.popHeader}>
                  <span className={styles.popTitle}>Notificações</span>
                  <button className={styles.popAction}>Marcar todas</button>
                </div>
                {NOTIFICATIONS.map(n => {
                  const NIcon = n.icon;
                  return (
                    <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles.unread : ""}`}>
                      <div className={styles.notifIconWrap}><NIcon size={14} /></div>
                      <div className={styles.notifBody}>
                        <span className={styles.notifText}>{n.text}</span>
                        <span className={styles.notifTime}>{n.time} atrás</span>
                      </div>
                    </div>
                  );
                })}
                <div className={styles.popConstruct}>
                  <Construction size={13} /> Em construção
                </div>
              </div>
            )}
          </div>

          {/* Tema */}
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Avatar / dropdown */}
          <div ref={menuRef} className={styles.avatarWrap}>
            <button
              className={styles.avatarBtn}
              onClick={() => { setMenuOpen(v => !v); setNotifOpen(false); setMsgOpen(false); }}
            >
              <div className={styles.avatarContainer}>
                <div className={styles.avatar} style={{ background: cor }}>{myInitials}</div>
                <span className={styles.onlineDot} />
              </div>
              <span className={styles.avatarName}>{currentUser.nome}</span>
              <ChevronDown size={12} className={styles.chevron} />
            </button>

            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropUser}>
                  <div className={styles.dropAvatar} style={{ background: cor }}>{myInitials}</div>
                  <div>
                    <div className={styles.dropName}>{currentUser.nome}</div>
                    <div className={styles.dropSub}>{currentUser.papelDescricao} · {currentUser.email}</div>
                  </div>
                </div>
                <div className={styles.dropDivider} />
                {MENU_ITEMS.map(({ label, icon: Icon }) => (
                  <button key={label} className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                    <Icon size={14} />{label}
                  </button>
                ))}
                <div className={styles.dropDivider} />
                <button className={styles.dropSair} onClick={() => signOut(router)}>
                  <LogOut size={14} /> Sair
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
