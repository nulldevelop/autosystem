import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allCookies = request.cookies.getAll();
  const hasSessionCookie = allCookies.some(
    (c) =>
      c.name.includes("auth_session") ||
      c.name.includes("session_token") ||
      c.name.includes("better-auth.session"),
  );

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // 1. Se não houver cookie de sessão e tentar acessar dashboard, vai para login
  if (!hasSessionCookie && isDashboardPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 2. Se houver cookie de sessão e tentar acessar login, vai para dashboard
  // Nota: Deixamos o usuário entrar no /auth se ele quiser explicitamente,
  // ou podemos redirecionar. Aqui manteremos o redirecionamento para dashboard se logado.
  if (hasSessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
