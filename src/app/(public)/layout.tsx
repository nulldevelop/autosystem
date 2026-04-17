import type { Metadata } from "next";
import "../../styles/globals.css";

export const metadata: Metadata = {
  title: "AutoSystem - Sistema de Gerenciamento para Oficinas Automotivas",
  description: "Sistema de gerenciamento para oficinas automotivas",
  icons: {
    icon: "/images/logo-f1.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
