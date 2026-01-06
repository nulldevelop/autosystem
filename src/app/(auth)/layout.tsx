import type { Metadata } from "next";
import "@/styles/globals.css";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/getSession";
import { AppSidebar } from "./dashboard/_components/app-sidebar";

export const metadata: Metadata = {
  title: "AutoSystem - Dashboard",
  description: "Painel de gerenciamento para oficinas automotivas",
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
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`antialiased  text-white`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-black">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/30 px-6 sticky top-0 bg-black/50 backdrop-blur-md z-30">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-gray-400 hover:text-green-500" />
                <div className="h-4 w-px bg-white/90 mx-2" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                  Gestão Automotiva
                </span>
              </div>
              <div className="flex items-center gap-4"></div>
            </header>

            <main className="flex-1 p-6 relative">
              <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-green-500/10 blur-[140px] pointer-events-none rounded-full" />
              <div className="relative z-10">{children}</div>
              <Toaster richColors />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
