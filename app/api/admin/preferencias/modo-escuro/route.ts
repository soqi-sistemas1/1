import { type NextRequest, NextResponse } from "next/server"
import { salvarPreferenciaModoEscuro, obterPreferenciaModoEscuro } from "@/services/administradores"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const modoEscuro = await obterPreferenciaModoEscuro(session.user.id)
    return NextResponse.json({ modoEscuro })
  } catch (error) {
    console.error("Erro ao obter preferência de modo escuro:", error)
    return NextResponse.json({ error: "Erro ao obter preferência de modo escuro" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { modoEscuro } = await request.json()

    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await salvarPreferenciaModoEscuro(session.user.id, modoEscuro)
    return NextResponse.json({ success: true, modoEscuro })
  } catch (error) {
    console.error("Erro ao salvar preferência de modo escuro:", error)
    return NextResponse.json({ error: "Erro ao salvar preferência de modo escuro" }, { status: 500 })
  }
}
