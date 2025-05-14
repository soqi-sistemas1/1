import { type NextRequest, NextResponse } from "next/server"
import { obterAdministrador, atualizarAdministrador, excluirAdministrador } from "@/services/administradores"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const administrador = await obterAdministrador(id)

    return NextResponse.json(administrador)
  } catch (error) {
    console.error("Erro ao obter administrador:", error)
    return NextResponse.json({ error: "Erro ao obter administrador" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { nome, email, cargo, ativo, superAdmin, novaSenha } = await request.json()

    // Atualizar o administrador no banco de dados
    const adminAtualizado = await atualizarAdministrador(id, {
      nome,
      email,
      cargo,
      ativo,
      super_admin: superAdmin,
    })

    // Se foi fornecida uma nova senha, atualizar no Auth
    if (novaSenha) {
      const supabase = createServerSupabaseClient()

      const { error: passwordError } = await supabase.auth.admin.updateUserById(adminAtualizado.user_id, {
        password: novaSenha,
      })

      if (passwordError) {
        console.error("Erro ao atualizar senha:", passwordError)
        return NextResponse.json({ error: passwordError.message }, { status: 500 })
      }
    }

    return NextResponse.json(adminAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar administrador:", error)
    return NextResponse.json({ error: "Erro ao atualizar administrador" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await excluirAdministrador(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir administrador:", error)
    return NextResponse.json({ error: "Erro ao excluir administrador" }, { status: 500 })
  }
}
