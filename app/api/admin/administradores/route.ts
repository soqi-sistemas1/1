import { type NextRequest, NextResponse } from "next/server"
import { listarAdministradores, criarAdministrador } from "@/services/administradores"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const administradores = await listarAdministradores()
    return NextResponse.json(administradores)
  } catch (error) {
    console.error("Erro ao listar administradores:", error)
    return NextResponse.json({ error: "Erro ao listar administradores" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, cargo, superAdmin } = await request.json()

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Criar o usuário no Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (userError) {
      console.error("Erro ao criar usuário:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Criar o administrador no banco de dados
    const novoAdmin = await criarAdministrador({
      user_id: userData.user.id,
      nome,
      email,
      cargo: cargo || "Administrador",
      ativo: true,
      super_admin: superAdmin || false,
    })

    return NextResponse.json(novoAdmin)
  } catch (error) {
    console.error("Erro ao criar administrador:", error)
    return NextResponse.json({ error: "Erro ao criar administrador" }, { status: 500 })
  }
}
