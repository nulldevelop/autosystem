import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Logo } from "@/components/ui/logo";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/getSession";
import { AppSidebar } from "./dashboard/_components/app-sidebar";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { HeaderUserMenu } from "./dashboard/_components/header-user-menu";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "AutoSystem - Dashboard",
  description: "Painel de gerenciamento para oficinas automotivas",
  icons: {
    icon: "/images/logo-f1.svg",
  },
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await getSession();
  if (!sessionData) {
    console.log("No active session found, redirecting to login.");
    redirect("/");
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen =
    sidebarState === undefined ? true : sidebarState === "true";

  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased text-white bg-[#0a0a0a]`}
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset className="bg-[#0a0a0a] tech-grid">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/5 px-6 sticky top-0 bg-black/40 backdrop-blur-xl z-30">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1 text-gray-400 hover:text-primary transition-colors" />
                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                <div className="flex items-center gap-3">
                  <Logo />
                  <div className="flex flex-col leading-none">
                    <span className="text-xl font-black italic tracking-tighter text-white">
                      AUTO<span className="text-primary">SYSTEM</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    System Online
                  </span>
                </div>
                <HeaderUserMenu session={sessionData} />
              </div>
            </header>

            <main className="flex-1 p-6 relative min-h-[calc(100vh-4rem)]">
              <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
              <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-secondary/5 blur-[100px] pointer-events-none rounded-full" />
              <div className="relative z-10 mx-auto w-full">
                {children}
              </div>
              <Toaster richColors duration={2000} position="top-right" />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
