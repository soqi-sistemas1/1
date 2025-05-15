import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autorizado" }, { status: 401 })
    }

    const { modoEscuro } = await request.json()

    // Atualizar preferência de modo escuro
    const { error } = await supabase.from("preferencias_usuario").upsert({
      user_id: session.user.id,
      modo_escuro: modoEscuro,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro ao atualizar preferência de modo escuro:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar preferência" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Preferência atualizada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
