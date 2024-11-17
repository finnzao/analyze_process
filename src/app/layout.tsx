
import React from "react";

import "./globals.css";
export const metadata = {
  title: 'Analisar Processos',
  description: 'Aplicação para análise de planilhas de processos',
  icons: {
    icon: '/favicon.ico',
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
