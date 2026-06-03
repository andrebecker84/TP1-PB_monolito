"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";
import styles from "./LeftPanel.module.css";

const WEEK_DAYS = ["S","T","Q","Q","S","S","D"];
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

type Status = "done" | "pending" | "nao_iniciada" | "atrasada";

const TAREFAS: { titulo: string; data: string; dia: number; grupo: string; status: Status }[] = [
  { titulo: "TP1-PB Monolito",      data: "02 Jun", dia: 2,  grupo: "Eng. de Softwares Escaláveis", status: "done"        },
  { titulo: "TP2-PB Persistência",  data: "09 Jun", dia: 9,  grupo: "Eng. de Softwares Escaláveis", status: "pending"     },
  { titulo: "Assessment — Aula 06", data: "11 Jun", dia: 11, grupo: "Design Patterns e DDD",        status: "atrasada"    },
  { titulo: "React Final Project",  data: "14 Jun", dia: 14, grupo: "Dev. Web com React",           status: "nao_iniciada"},
  { titulo: "Mobile Assessment",    data: "18 Jun", dia: 18, grupo: "Dev. Mobile React Native",     status: "nao_iniciada"},
];

const TASK_MAP = new Map(TAREFAS.map(t => [t.dia, t]));

const STATUS_LABEL: Record<Status, string> = {
  done:          "Concluída",
  pending:       "Em andamento",
  nao_iniciada:  "Não iniciada",
  atrasada:      "Atrasada",
};

function buildCalendar(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const offset   = (firstDay + 6) % 7; // segunda=0, ..., domingo=6
  const total    = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

interface TooltipPos { task: typeof TAREFAS[0]; x: number; y: number; }

export default function LeftPanel() {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [tip, setTip] = useState<TooltipPos | null>(null);

  const showTip = (e: React.MouseEvent, task: typeof TAREFAS[0]) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ task, x: r.left + r.width / 2, y: r.top });
  };

  const cells  = buildCalendar(calYear, calMonth);
  const todayD = today.getFullYear() === calYear && today.getMonth() === calMonth
    ? today.getDate() : -1;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  return (
    <aside className={styles.panel}>

      {/* ── Calendário ── */}
      <div className={styles.card}>
        <div className={styles.calHeader}>
          <button className={styles.calNav} onClick={prevMonth}><ChevronLeft size={15} /></button>
          <span className={styles.calTitle}>{MONTHS[calMonth]} {calYear}</span>
          <button className={styles.calNav} onClick={nextMonth}><ChevronRight size={15} /></button>
        </div>
        <div className={styles.calGrid}>
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className={styles.calDay}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const task = d ? TASK_MAP.get(d) : undefined;
            return (
              <div
                key={i}
                className={`${styles.calCell} ${d === todayD ? styles.calToday : ""} ${task ? styles.calTask : ""}`}
                onMouseEnter={task ? (e) => showTip(e, task) : undefined}
                onMouseLeave={task ? () => setTip(null) : undefined}
              >
                {d ?? ""}
                {task && <span className={`${styles.taskDot} ${styles[`dot_${task.status}`]}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tarefas & Entregas ── */}
      <div className={styles.card}>
        <h3 className={styles.title}>Tarefas &amp; Entregas</h3>
        <div className={styles.tarefaList}>
          {TAREFAS.map((t, i) => (
            <div key={i} className={`${styles.tarefaItem} ${t.status === "done" ? styles.tarefaDone : ""}`}>
              <div className={styles.tarefaStatus}>
                {t.status === "done"        && <CheckCircle2 size={15} className={styles.iconDone}        />}
                {t.status === "pending"     && <Clock        size={15} className={styles.iconPending}     />}
                {t.status === "nao_iniciada"&& <Circle       size={15} className={styles.iconNaoIniciada} />}
                {t.status === "atrasada"    && <AlertCircle  size={15} className={styles.iconAtrasada}    />}
              </div>
              <div className={styles.tarefaInfo}>
                <span className={styles.tarefaTitulo}>{t.titulo}</span>
                <span className={styles.tarefaMeta}>{t.grupo}</span>
              </div>
              <span className={styles.tarefaData}>{t.data}</span>
            </div>
          ))}
        </div>
      </div>

      {tip && createPortal(
        <div className={styles.tooltip} style={{ left: tip.x, top: tip.y - 8 }}>
          <span className={styles.ttTitle}>{tip.task.titulo}</span>
          <span className={`${styles.ttBadge} ${styles[`ttBadge_${tip.task.status}`]}`}>
            {STATUS_LABEL[tip.task.status]}
          </span>
          <span className={styles.ttGrupo}>{tip.task.grupo}</span>
        </div>,
        document.body
      )}
    </aside>
  );
}
