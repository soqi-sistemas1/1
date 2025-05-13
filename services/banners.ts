import { createServerSupabaseClient } from "@/lib/supabase"

export type Banner = {
  id: number
  titulo: string
  imagem_url: string
  ordem: number
  ativo: boolean
  created_at: string
}

export async function listarBanners(apenasAtivos = true) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("banners").select("*").order("ordem")

  if (apenasAtivos) {
    query = query.eq("ativo", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao listar banners:", error)
    throw new Error("Não foi possível carregar os banners")
  }

  return data as Banner[]
}

export async function obterBanner(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("banners").select("*").eq("id", id).single()

  if (error) {
    console.error("Erro ao obter banner:", error)
    throw new Error("Não foi possível carregar o banner")
  }

  return data as Banner
}

export async function criarBanner(banner: Omit<Banner, "id" | "created_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("banners").insert(banner).select().single()

  if (error) {
    console.error("Erro ao criar banner:", error)
    throw new Error("Não foi possível criar o banner")
  }

  return data as Banner
}

export async function atualizarBanner(id: number, banner: Partial<Omit<Banner, "id" | "created_at">>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("banners").update(banner).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar banner:", error)
    throw new Error("Não foi possível atualizar o banner")
  }

  return data as Banner
}

export async function excluirBanner(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("banners").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir banner:", error)
    throw new Error("Não foi possível excluir o banner")
  }

  return true
}
