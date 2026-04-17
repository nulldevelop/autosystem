import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased text-white bg-[#0a0a0a]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster richColors duration={2000} position="top-right" />
      </body>
    </html>
  );
}
