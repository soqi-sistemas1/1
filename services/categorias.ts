import { createServerSupabaseClient } from "@/lib/supabase"

export type Categoria = {
  id: number
  nome: string
  ativo: boolean
  created_at: string
}

export async function listarCategorias(apenasAtivas = true) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("categorias").select("*").order("nome")

  if (apenasAtivas) {
    query = query.eq("ativo", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao listar categorias:", error)
    throw new Error("Não foi possível carregar as categorias")
  }

  return data as Categoria[]
}

export async function obterCategoria(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categorias").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao obter categoria:", error)
    throw new Error("Não foi possível carregar a categoria")
  }

  return data as Categoria
}

export async function criarCategoria(categoria: Omit<Categoria, "id" | "created_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categorias").insert(categoria).select().single()

  if (error) {
    console.error("Erro ao criar categoria:", error)
    throw new Error("Não foi possível criar a categoria")
  }

  return data as Categoria
}

export async function atualizarCategoria(id: number, categoria: Partial<Omit<Categoria, "id" | "created_at">>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("categorias").update(categoria).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar categoria:", error)
    throw new Error("Não foi possível atualizar a categoria")
  }

  return data as Categoria
}

export async function excluirCategoria(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("categorias").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir categoria:", error)
    throw new Error("Não foi possível excluir a categoria")
  }

  return true
}
