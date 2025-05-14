import { createServerSupabaseClient } from "@/lib/supabase"

export type Administrador = {
  id: number
  user_id: string
  nome: string
  email: string
  cargo: string
  ativo: boolean
  super_admin: boolean
  created_at: string
}

export async function listarAdministradores() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("administradores").select("*").order("nome")

  if (error) {
    console.error("Erro ao listar administradores:", error)
    throw new Error("Não foi possível carregar os administradores")
  }

  return data as Administrador[]
}

export async function obterAdministrador(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("administradores").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao obter administrador:", error)
    throw new Error("Não foi possível carregar o administrador")
  }

  return data as Administrador
}

export async function obterAdministradorPorUserId(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("administradores").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    // Ignorar erro de não encontrado
    console.error("Erro ao obter administrador por user_id:", error)
    throw new Error("Não foi possível carregar o administrador")
  }

  return data as Administrador | null
}

export async function criarAdministrador(admin: Omit<Administrador, "id" | "created_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("administradores").insert(admin).select().single()

  if (error) {
    console.error("Erro ao criar administrador:", error)
    throw new Error("Não foi possível criar o administrador")
  }

  return data as Administrador
}

export async function atualizarAdministrador(id: number, admin: Partial<Omit<Administrador, "id" | "created_at">>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("administradores").update(admin).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar administrador:", error)
    throw new Error("Não foi possível atualizar o administrador")
  }

  return data as Administrador
}

export async function excluirAdministrador(id: number) {
  const supabase = createServerSupabaseClient()

  // Primeiro, obtemos o user_id do administrador
  const { data: admin, error: errorAdmin } = await supabase
    .from("administradores")
    .select("user_id")
    .eq("id", id)
    .single()

  if (errorAdmin) {
    console.error("Erro ao obter administrador para exclusão:", errorAdmin)
    throw new Error("Não foi possível encontrar o administrador")
  }

  // Excluímos o registro da tabela administradores
  const { error: errorDelete } = await supabase.from("administradores").delete().eq("id", id)

  if (errorDelete) {
    console.error("Erro ao excluir administrador:", errorDelete)
    throw new Error("Não foi possível excluir o administrador")
  }

  // Excluímos o usuário do Supabase Auth
  const { error: errorDeleteUser } = await supabase.auth.admin.deleteUser(admin.user_id)

  if (errorDeleteUser) {
    console.error("Erro ao excluir usuário do Auth:", errorDeleteUser)
    throw new Error("Não foi possível excluir o usuário de autenticação")
  }

  return true
}

export async function salvarPreferenciaModoEscuro(userId: string, modoEscuro: boolean) {
  const supabase = createServerSupabaseClient()

  // Verificar se já existe uma preferência para este usuário
  const { data: existingPref } = await supabase.from("preferencias_usuario").select("id").eq("user_id", userId).single()

  if (existingPref) {
    // Atualizar preferência existente
    const { error } = await supabase
      .from("preferencias_usuario")
      .update({
        modo_escuro: modoEscuro,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Erro ao atualizar preferência de modo escuro:", error)
      throw new Error("Não foi possível salvar a preferência de modo escuro")
    }
  } else {
    // Criar nova preferência
    const { error } = await supabase.from("preferencias_usuario").insert({
      user_id: userId,
      modo_escuro: modoEscuro,
    })

    if (error) {
      console.error("Erro ao criar preferência de modo escuro:", error)
      throw new Error("Não foi possível salvar a preferência de modo escuro")
    }
  }

  return true
}

export async function obterPreferenciaModoEscuro(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("preferencias_usuario")
    .select("modo_escuro")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    // Ignorar erro de não encontrado
    console.error("Erro ao obter preferência de modo escuro:", error)
    throw new Error("Não foi possível carregar a preferência de modo escuro")
  }

  return data?.modo_escuro ?? false
}
