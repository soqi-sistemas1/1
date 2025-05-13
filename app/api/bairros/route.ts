import { type NextRequest, NextResponse } from "next/server"
import { listarBairros, criarBairro } from "@/services/bairros"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const apenasAtivos = searchParams.get("ativos") !== "false"

    const bairros = await listarBairros(apenasAtivos)

    return NextResponse.json(bairros)
  } catch (error) {
    console.error("Erro ao listar bairros:", error)
    return NextResponse.json({ error: "Erro ao listar bairros" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const bairro = await request.json()
    const novoBairro = await criarBairro(bairro)

    return NextResponse.json(novoBairro)
  } catch (error) {
    console.error("Erro ao criar bairro:", error)
    return NextResponse.json({ error: "Erro ao criar bairro" }, { status: 500 })
  }
}
