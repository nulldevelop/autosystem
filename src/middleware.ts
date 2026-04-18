import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Obter a sessão via fetch nativo
  const sessionResponse = await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  const session = await sessionResponse.json();

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // 2. Se não houver sessão e tentar acessar dashboard, vai para login
  if (!session && isDashboardPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 3. Se houver sessão (session.user existe) e tentar acessar login, vai para dashboard
  if (session?.user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger todas as rotas de dashboard e a página de auth
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};
