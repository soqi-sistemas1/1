import { type NextRequest, NextResponse } from "next/server"
import { obterConfiguracoes, atualizarConfiguracoes } from "@/services/configuracoes"

export async function GET() {
  try {
    const configuracoes = await obterConfiguracoes()

    return NextResponse.json(configuracoes)
  } catch (error) {
    console.error("Erro ao obter configurações:", error)
    return NextResponse.json({ error: "Erro ao obter configurações" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const configuracoes = await request.json()
    const configuracoesAtualizadas = await atualizarConfiguracoes(configuracoes)

    return NextResponse.json(configuracoesAtualizadas)
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 })
  }
}
