import { type NextRequest, NextResponse } from "next/server"
import { listarCategorias, criarCategoria } from "@/services/categorias"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const apenasAtivas = searchParams.get("ativas") !== "false"

    const categorias = await listarCategorias(apenasAtivas)

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Erro ao listar categorias:", error)
    return NextResponse.json({ error: "Erro ao listar categorias" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const categoria = await request.json()
    const novaCategoria = await criarCategoria(categoria)

    return NextResponse.json(novaCategoria)
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }
}
