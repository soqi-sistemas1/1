import { createServerSupabaseClient } from "@/lib/supabase"

export async function uploadImagem(arquivo: File, pasta: string) {
  const supabase = createServerSupabaseClient()

  // Gera um nome único para o arquivo
  const extensao = arquivo.name.split(".").pop()
  const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extensao}`
  const caminhoCompleto = `${pasta}/${nomeArquivo}`

  // Faz o upload para o bucket 'imagens'
  const { data, error } = await supabase.storage.from("imagens").upload(caminhoCompleto, arquivo, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Erro ao fazer upload da imagem:", error)
    throw new Error("Não foi possível fazer o upload da imagem")
  }

  // Obtém a URL pública da imagem
  const { data: urlData } = supabase.storage.from("imagens").getPublicUrl(caminhoCompleto)

  return urlData.publicUrl
}
