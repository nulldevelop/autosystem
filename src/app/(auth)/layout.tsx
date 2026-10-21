import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { Logo } from "@/components/ui/logo";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/getSession";
import { AppSidebar } from "./dashboard/_components/app-sidebar";
import { HeaderUserMenu } from "./dashboard/_components/header-user-menu";
import { MobileDock } from "./dashboard/_components/mobile-dock";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionData = await getSession();

  if (!sessionData) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen =
    sidebarState === undefined ? true : sidebarState === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-md sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-1 hidden text-muted-foreground hover:text-foreground lg:inline-flex" />
            <div className="flex items-center gap-2 lg:hidden">
              <Logo className="size-7" />
              <span className="font-display text-base font-semibold tracking-tight">
                Auto<span className="text-primary">System</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <HeaderUserMenu session={sessionData} />
          </div>
        </header>

        <main className="pb-dock mx-auto w-full max-w-[1760px] flex-1 px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:pb-10">
          {children}
        </main>

        <MobileDock />
        <PWAInstallPrompt />
      </SidebarInset>
    </SidebarProvider>
  );
}
