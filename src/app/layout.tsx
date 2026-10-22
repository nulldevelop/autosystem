import "@/styles/globals.css";
import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Bricolage_Grotesque,
  Caveat,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const barlow = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "AutoSystem - Gestão para Oficinas",
  description: "Sistema de gestão para oficinas automotivas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AutoSystem",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/images/logo-f1.svg",
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bricolage.variable} ${jetbrains.variable} ${barlow.variable} ${caveat.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors duration={2000} position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
