import { createServerSupabaseClient } from "@/lib/supabase"

export type MetodoPagamento = {
  id: number
  nome: string
  valor: string
  ativo: boolean
  created_at: string
}

export async function listarMetodosPagamento(apenasAtivos = true) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("metodos_pagamento").select("*").order("nome")

  if (apenasAtivos) {
    query = query.eq("ativo", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao listar métodos de pagamento:", error)
    throw new Error("Não foi possível carregar os métodos de pagamento")
  }

  return data as MetodoPagamento[]
}

export async function obterMetodoPagamento(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("metodos_pagamento").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao obter método de pagamento:", error)
    throw new Error("Não foi possível carregar o método de pagamento")
  }

  return data as MetodoPagamento
}

export async function criarMetodoPagamento(metodoPagamento: Omit<MetodoPagamento, "id" | "created_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("metodos_pagamento").insert(metodoPagamento).select().single()

  if (error) {
    console.error("Erro ao criar método de pagamento:", error)
    throw new Error("Não foi possível criar o método de pagamento")
  }

  return data as MetodoPagamento
}

export async function atualizarMetodoPagamento(
  id: number,
  metodoPagamento: Partial<Omit<MetodoPagamento, "id" | "created_at">>,
) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("metodos_pagamento")
    .update(metodoPagamento)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar método de pagamento:", error)
    throw new Error("Não foi possível atualizar o método de pagamento")
  }

  return data as MetodoPagamento
}

export async function excluirMetodoPagamento(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("metodos_pagamento").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir método de pagamento:", error)
    throw new Error("Não foi possível excluir o método de pagamento")
  }

  return true
}
