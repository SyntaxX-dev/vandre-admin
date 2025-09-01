import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { MAINTENANCE_CONFIG } from "./constants/maintenance";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("token");
  const response = NextResponse.next();

  // Verificar modo de manutenção
  if (MAINTENANCE_CONFIG.isMaintenanceMode) {
    const pathname = request.nextUrl.pathname;
    
    // Se já estiver na página de manutenção, permitir acesso
    if (pathname === "/maintenance") {
      return response;
    }
    
    // Se não estiver na página de manutenção, redirecionar e PARAR aqui
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Verifica se a rota é publica
  if (request.nextUrl.pathname === "/") {
    // Se o usuario esta logado e tenta acessar a pagina de login, redireciona para o dashboard
    if (authCookie) {
      const queryParams = request.nextUrl.search;
      return NextResponse.redirect(
        request.nextUrl.origin + "/dashboard" + queryParams
      );
    }
    return response;
  }

  // Verifica se o usuario não esta logado e redireciona para o login
  if (!authCookie) {
    if (
      request.nextUrl.pathname !== "/" /* &&
      request.nextUrl.pathname !== "/register" &&
      request.nextUrl.pathname !== "/recover" */
    ) {
      const queryParams = request.nextUrl.search;
      return NextResponse.redirect(
        request.nextUrl.origin + "/" + queryParams
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|auto-login|_next/static|_next/image|favicon.ico|assets|icons|images|videos|locales|manifest.json|sw.js|logo1024.png|scripts|styles).*)",
  ],
};
