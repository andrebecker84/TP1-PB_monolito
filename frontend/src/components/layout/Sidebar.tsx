"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, User, Users, Trophy, Briefcase,
  MessageSquare, Settings, LogOut,
  FileText, BookOpen, Monitor, CalendarDays, BookMarked,
  Menu, PanelLeftClose, Hexagon, ExternalLink, X,
} from "lucide-react";
import { Usuario } from "@/types";
import { signOut } from "@/hooks/useCurrentUser";
import { initials } from "@/utils/format";
import { CORES, PAPEL_BG, PAPEL_TXT } from "@/utils/colors";
import styles from "./Sidebar.module.css";

interface Props {
  expanded: boolean;
  currentUser: Usuario;
  onToggleSidebar: () => void;
}

const NAV = [
  { label: "Feed",          icon: LayoutDashboard, href: "/feed"  },
  { label: "Perfil",        icon: User,            href: "/feed"  },
  { label: "Grupos",        icon: Users,           href: "/feed"  },
  { label: "Trilhas",       icon: Trophy,          href: "/feed"  },
  { label: "Vagas",         icon: Briefcase,       href: "/vagas" },
  { label: "Mensagens",     icon: MessageSquare,   href: "/feed"  },
  { label: "Configurações", icon: Settings,        href: "/feed"  },
];

const LINKS = [
  { label: "Requerimentos",        icon: FileText,     noEmbed: false, href: "https://requerimentos.infnet.edu.br/",                                                             extHref: "https://requerimentos.infnet.edu.br/" },
  { label: "Manual de Graduação",  icon: BookOpen,     noEmbed: false, href: "https://docs.google.com/document/d/1f1X-9SuN02CYcXcNlFrzsJ_Xb9y6AUwRQ8B2782e8vk/preview",      extHref: "https://docs.google.com/document/d/1f1X-9SuN02CYcXcNlFrzsJ_Xb9y6AUwRQ8B2782e8vk/" },
  { label: "Manual da Pós Live",   icon: Monitor,      noEmbed: true,  href: "https://sites.google.com/infnet.edu.br/manualposlive/pos-live",                                  extHref: "https://sites.google.com/infnet.edu.br/manualposlive/pos-live" },
  { label: "Calendário Acadêmico", icon: CalendarDays, noEmbed: false, href: "https://docs.google.com/spreadsheets/d/1b-CaoKxQZVM9zH1q0Bruoyf3BimlUiwIJSvL828N5JU/preview",  extHref: "https://docs.google.com/spreadsheets/d/1b-CaoKxQZVM9zH1q0Bruoyf3BimlUiwIJSvL828N5JU/" },
  { label: "Biblioteca Virtual",   icon: BookMarked,   noEmbed: true,  href: "https://learning.oreilly.com/home/",                                                              extHref: "https://learning.oreilly.com/home/" },
];

export default function Sidebar({ expanded, currentUser, onToggleSidebar }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const avatarInitials = initials(currentUser.nome);
  const cor            = CORES[currentUser.id % CORES.length];
  const [modal,    setModal]    = useState<{ url: string; extHref: string; title: string } | null>(null);
  const [iframeOk, setIframeOk] = useState(true);

  return (
    <aside className={`${styles.sidebar} ${expanded ? styles.expanded : ""}`}>

      {/* ── Topo: hamburger + logo ── */}
      <div className={styles.sidebarTop}>
        <button
          className={styles.hamburger}
          onClick={onToggleSidebar}
          title={expanded ? "Recolher menu" : "Expandir menu"}
        >
          {expanded ? <PanelLeftClose size={20} /> : <Menu size={20} />}
        </button>
        <div className={styles.sidebarLogo}>
          <Hexagon size={18} className={styles.sidebarLogoIcon} />
          <span className={styles.sidebarLogoText}>INFNET HUB</span>
        </div>
      </div>

      {/* ── Perfil ── */}
      <div className={styles.profile}>
        <div className={styles.avatar} style={{ background: cor }}>{avatarInitials}</div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{currentUser.nome}</span>
          <span
            className={styles.papelBadge}
            style={{ background: PAPEL_BG[currentUser.papel], color: PAPEL_TXT[currentUser.papel] }}
          >
            {currentUser.papelDescricao}
          </span>
          {currentUser.escola && (
            <span className={styles.profileEscola}>
              {currentUser.escola}{currentUser.classe ? ` · ${currentUser.classe}` : ""}
            </span>
          )}
        </div>
      </div>

      <div className={styles.secDivider}>
        <div className={styles.secLine} />
        <span className={styles.secTxt}>Plataforma</span>
        <div className={styles.secLine} />
      </div>

      {/* ── Navegação principal ── */}
      <nav className={styles.nav}>
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = pathname === href && (label === "Feed" || label === "Vagas");
          return (
            <button
              key={label}
              className={`${styles.navItem} ${active ? styles.active : ""}`}
              onClick={() => router.push(href)}
              title={!expanded ? label : undefined}
            >
              <Icon size={19} className={styles.ico} />
              <span className={styles.lbl}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.secDivider}>
        <div className={styles.secLine} />
        <span className={styles.secTxt}>Institucional</span>
        <div className={styles.secLine} />
      </div>

      <div className={styles.linkList}>
        {LINKS.map(({ label, icon: Icon, href, extHref, noEmbed }) => (
          <button
            key={href}
            className={styles.linkItem}
            title={!expanded ? label : undefined}
            onClick={() => { setIframeOk(!noEmbed); setModal({ url: href, extHref, title: label }); }}
          >
            <Icon size={18} className={styles.ico} />
            <span className={styles.lbl}>{label}</span>
          </button>
        ))}
      </div>

      {modal && createPortal(
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{modal.title}</span>
              <div className={styles.modalActions}>
                <a href={modal.extHref} target="_blank" rel="noopener noreferrer" className={styles.modalExtBtn}>
                  <ExternalLink size={13} /> Abrir em nova aba
                </a>
                <button className={styles.modalClose} onClick={() => setModal(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            {!iframeOk ? (
              <div className={styles.modalBlocked}>
                <ExternalLink size={32} className={styles.modalBlockedIcon} />
                <p>Este site não permite visualização incorporada.</p>
                <a href={modal.extHref} target="_blank" rel="noopener noreferrer" className={styles.modalBlockedBtn}>
                  Abrir em nova aba
                </a>
              </div>
            ) : (
              <iframe
                src={modal.url}
                className={styles.modalFrame}
                title={modal.title}
                onError={() => setIframeOk(false)}
                onLoad={e => {
                  try {
                    const doc = (e.target as HTMLIFrameElement).contentDocument;
                    if (doc && doc.body && doc.body.innerHTML === "") setIframeOk(false);
                  } catch { /* cross-origin — carregou normalmente */ }
                }}
              />
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── Sair ── */}
      <div className={styles.sidebarFooter}>
        <button
          className={styles.sairBtn}
          onClick={() => signOut(router)}
          title={!expanded ? "Sair" : undefined}
        >
          <LogOut size={19} className={styles.ico} />
          <span className={styles.lbl}>Sair da conta</span>
        </button>
      </div>

    </aside>
  );
}
