import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infnet Hub",
  description: "A plataforma dos estudantes Infnet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){const t=localStorage.getItem('infnet-theme');if(t)document.documentElement.setAttribute('data-theme',t);})()`
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
