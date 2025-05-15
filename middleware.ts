import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Verificar se o usuário está tentando acessar rotas administrativas
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isLoginRoute = req.nextUrl.pathname === "/admin/login"
  const isSetupRoute = req.nextUrl.pathname === "/admin/setup"

  // Permitir acesso à página de setup e login sem autenticação
  if (isSetupRoute || isLoginRoute) {
    return res
  }

  // Se for uma rota administrativa e não estiver autenticado, redirecionar para login
  if (isAdminRoute && !session) {
    const redirectUrl = new URL("/admin/login", req.url)
    redirectUrl.searchParams.set("from", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ["/admin/:path*"],
}
