import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const id = params.id
    const { nome, email, cargo, senha, ativo, super_admin } = await request.json()

    // Buscar o administrador atual
    const { data: adminAtual, error: adminError } = await supabase
      .from("administradores")
      .select("*")
      .eq("id", id)
      .single()

    if (adminError) {
      return NextResponse.json({ success: false, message: "Administrador não encontrado" }, { status: 404 })
    }

    // Atualizar dados do administrador
    const { error: updateError } = await supabase
      .from("administradores")
      .update({
        nome,
        email,
        cargo,
        ativo,
        super_admin,
      })
      .eq("id", id)

    if (updateError) {
      console.error("Erro ao atualizar administrador:", updateError)
      return NextResponse.json({ success: false, message: "Erro ao atualizar administrador" }, { status: 500 })
    }

    // Se uma nova senha foi fornecida, atualizar a senha
    if (senha) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(adminAtual.user_id, { password: senha })

      if (passwordError) {
        console.error("Erro ao atualizar senha:", passwordError)
        return NextResponse.json({ success: false, message: "Erro ao atualizar senha" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Administrador atualizado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const id = params.id

    // Buscar o administrador a ser excluído
    const { data: adminToDelete, error: adminError } = await supabase
      .from("administradores")
      .select("*")
      .eq("id", id)
      .single()

    if (adminError) {
      return NextResponse.json({ success: false, message: "Administrador não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário está tentando excluir a si mesmo
    if (adminToDelete.user_id === session.user.id) {
      return NextResponse.json({ success: false, message: "Você não pode excluir sua própria conta" }, { status: 400 })
    }

    // Excluir o administrador
    const { error: deleteError } = await supabase.from("administradores").delete().eq("id", id)

    if (deleteError) {
      console.error("Erro ao excluir administrador:", deleteError)
      return NextResponse.json({ success: false, message: "Erro ao excluir administrador" }, { status: 500 })
    }

    // Excluir o usuário do Supabase Auth
    const { error: userDeleteError } = await supabase.auth.admin.deleteUser(adminToDelete.user_id)

    if (userDeleteError) {
      console.error("Erro ao excluir usuário:", userDeleteError)
      return NextResponse.json({ success: false, message: "Erro ao excluir usuário" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Administrador excluído com sucesso",
    })
  } catch (error) {
    console.error("Erro ao processar solicitação:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
