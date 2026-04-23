import { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    console.error("Middleware session check failed:", error);
    console.log("Cookies:", JSON.stringify(request.cookies.getAll()));
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Raw error:", JSON.stringify(error));
    }
    // Fallback: check if session cookie exists as a hint
    const hasSessionCookie = request.cookies.getAll().some(c => c.name.includes("session_token"));
    if (hasSessionCookie) {
      // If we have a cookie but DB check failed, we might want to allow it 
      // and let the Server Component handle the real check (which has more context/retries)
      return NextResponse.next();
    }
  }

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // 1. Se não houver sessão e tentar acessar dashboard, vai para login
  if (!session && isDashboardPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 2. Se houver sessão (session.user existe) e tentar acessar login, vai para dashboard
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
