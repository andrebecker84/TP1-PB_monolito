"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Toaster from "@/components/ui/Toaster";
import { Usuario } from "@/types";
import styles from "./AppLayout.module.css";

interface Props {
  currentUser: Usuario;
  children: React.ReactNode;
}

export default function AppLayout({ currentUser, children }: Props) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div
      className={styles.app}
      style={{
        '--sidebar-w': sidebarExpanded ? 'var(--sidebar-full)' : 'var(--sidebar-mini)',
      } as React.CSSProperties}
    >
      <Header
        currentUser={currentUser}
        sidebarExpanded={sidebarExpanded}
      />
      <Sidebar
        expanded={sidebarExpanded}
        currentUser={currentUser}
        onToggleSidebar={() => setSidebarExpanded(v => !v)}
      />
      <div className={styles.content}>{children}</div>
      <Toaster />
    </div>
  );
}
