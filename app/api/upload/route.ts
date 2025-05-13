import { type NextRequest, NextResponse } from "next/server"
import { uploadImagem } from "@/services/upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const arquivo = formData.get("arquivo") as File
    const pasta = (formData.get("pasta") as string) || "geral"

    if (!arquivo) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const url = await uploadImagem(arquivo, pasta)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Erro ao processar upload:", error)
    return NextResponse.json({ error: "Erro ao processar upload" }, { status: 500 })
  }
}
