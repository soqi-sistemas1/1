import { createServerSupabaseClient } from "@/lib/supabase"

export type Produto = {
  id: number
  nome: string
  descricao: string
  preco: number
  imagem_url: string
  categoria_id: number
  ativo: boolean
  created_at: string
}

export async function listarProdutos(apenasAtivos = true, categoriaId?: number) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("produtos").select("*, categorias(nome)").order("nome")

  if (apenasAtivos) {
    query = query.eq("ativo", true)
  }

  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao listar produtos:", error)
    throw new Error("Não foi possível carregar os produtos")
  }

  return data as (Produto & { categorias: { nome: string } })[]
}

export async function obterProduto(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("produtos").select("*, categorias(nome)").eq("id", id).single()

  if (error) {
    console.error("Erro ao obter produto:", error)
    throw new Error("Não foi possível carregar o produto")
  }

  return data as Produto & { categorias: { nome: string } }
}

export async function criarProduto(produto: Omit<Produto, "id" | "created_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("produtos").insert(produto).select().single()

  if (error) {
    console.error("Erro ao criar produto:", error)
    throw new Error("Não foi possível criar o produto")
  }

  return data as Produto
}

export async function atualizarProduto(id: number, produto: Partial<Omit<Produto, "id" | "created_at">>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("produtos").update(produto).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar produto:", error)
    throw new Error("Não foi possível atualizar o produto")
  }

  return data as Produto
}

export async function excluirProduto(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("produtos").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir produto:", error)
    throw new Error("Não foi possível excluir o produto")
  }

  return true
}
