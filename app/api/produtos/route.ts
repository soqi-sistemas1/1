import { type NextRequest, NextResponse } from "next/server"
import { listarProdutos, criarProduto } from "@/services/produtos"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoriaId = searchParams.get("categoria")
    const apenasAtivos = searchParams.get("ativos") !== "false"

    const produtos = await listarProdutos(apenasAtivos, categoriaId ? Number.parseInt(categoriaId) : undefined)

    return NextResponse.json(produtos)
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    return NextResponse.json({ error: "Erro ao listar produtos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const produto = await request.json()
    const novoProduto = await criarProduto(produto)

    return NextResponse.json(novoProduto)
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
