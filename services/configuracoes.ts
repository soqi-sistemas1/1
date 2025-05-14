import { createServerSupabaseClient } from "@/lib/supabase"

export type Configuracao = {
  id: number
  nome_estabelecimento: string
  telefone_whatsapp: string
  endereco: string
  horario_funcionamento: string
  logo_url: string
  cor_primaria: string
  cor_secundaria: string
  cor_acento: string
  cor_fundo: string
  cor_texto: string
  border_radius: string
  envio_automatico_whatsapp: boolean
  created_at: string
}

export async function obterConfiguracoes() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("configuracoes").select("*").order("id").limit(1).single()

  if (error) {
    console.error("Erro ao obter configurações:", error)
    throw new Error("Não foi possível carregar as configurações")
  }

  return data as Configuracao
}

export async function atualizarConfiguracoes(configuracoes: Partial<Omit<Configuracao, "id" | "created_at">>) {
  const supabase = createServerSupabaseClient()

  // Primeiro, verificamos se já existe uma configuração
  const { data: configExistente } = await supabase.from("configuracoes").select("id").limit(1)

  let result

  if (configExistente && configExistente.length > 0) {
    // Atualiza a configuração existente
    const { data, error } = await supabase
      .from("configuracoes")
      .update(configuracoes)
      .eq("id", configExistente[0].id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar configurações:", error)
      throw new Error("Não foi possível atualizar as configurações")
    }

    result = data
  } else {
    // Cria uma nova configuração
    const { data, error } = await supabase.from("configuracoes").insert(configuracoes).select().single()

    if (error) {
      console.error("Erro ao criar configurações:", error)
      throw new Error("Não foi possível criar as configurações")
    }

    result = data
  }

  return result as Configuracao
}
