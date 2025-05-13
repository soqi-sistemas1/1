import { createServerSupabaseClient } from "@/lib/supabase"

export type Bairro = {
  id: number
  nome: string
  taxa: number
  ativo: boolean
  created_at: string
}

export async function listarBairros(apenasAtivos = true) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("bairros").select("*").order("nome")

  if (apenasAtivos) {
    query = query.eq("ativo", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao listar bairros:", error)
    throw new Error("Não foi possível carregar os bairros")
  }

  return data as Bairro[]
}

export async function obterBairro(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("bairros").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao obter bairro:", error)
    throw new Error("Não foi possível carregar o bairro")
  }

  return data as Bairro
}

export async function criarBairro(bairro: Omit<Bairro, "id" | "created_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("bairros").insert(bairro).select().single()

  if (error) {
    console.error("Erro ao criar bairro:", error)
    throw new Error("Não foi possível criar o bairro")
  }

  return data as Bairro
}

export async function atualizarBairro(id: number, bairro: Partial<Omit<Bairro, "id" | "created_at">>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("bairros").update(bairro).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar bairro:", error)
    throw new Error("Não foi possível atualizar o bairro")
  }

  return data as Bairro
}

export async function excluirBairro(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("bairros").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir bairro:", error)
    throw new Error("Não foi possível excluir o bairro")
  }

  return true
}
