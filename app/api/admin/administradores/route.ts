import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é super admin
    const { data: adminData } = await supabase
      .from("administradores")
      .select("super_admin")
      .eq("user_id", session.user.id)
      .single()

    if (!adminData || !adminData.super_admin) {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    // Buscar todos os administradores
    const { data: administradores, error } = await supabase.from("administradores").select("*").order("nome")

    if (error) {
      console.error("Erro ao buscar administradores:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar administradores" }, { status: 500 })
    }

    return NextResponse.json({ success: true, administradores })
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

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

    // Verificar se o usuário é super admin
    const { data: adminData } = await supabase
      .from("administradores")
      .select("super_admin")
      .eq("user_id", session.user.id)
      .single()

    if (!adminData || !adminData.super_admin) {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    // Obter dados do corpo da requisição
    const { nome, email, cargo, senha, ativo, super_admin } = await request.json()

    // Validar dados
    if (!nome || !email || !senha) {
      return NextResponse.json({ success: false, message: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    // Criar usuário no Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (userError) {
      console.error("Erro ao criar usuário:", userError)
      return NextResponse.json({ success: false, message: userError.message }, { status: 400 })
    }

    // Criar registro na tabela de administradores
    const { data: novoAdmin, error: adminError } = await supabase
      .from("administradores")
      .insert({
        user_id: userData.user.id,
        nome,
        email,
        cargo,
        ativo: ativo !== undefined ? ativo : true,
        super_admin: super_admin || false,
      })
      .select()
      .single()

    if (adminError) {
      console.error("Erro ao criar administrador:", adminError)
      // Tentar excluir o usuário criado para evitar inconsistências
      await supabase.auth.admin.deleteUser(userData.user.id)
      return NextResponse.json({ success: false, message: "Erro ao criar administrador" }, { status: 500 })
    }

    // Criar registro de preferências do usuário
    await supabase.from("preferencias_usuario").insert({
      user_id: userData.user.id,
      modo_escuro: false,
    })

    return NextResponse.json({
      success: true,
      message: "Administrador criado com sucesso",
      administrador: novoAdmin,
    })
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
