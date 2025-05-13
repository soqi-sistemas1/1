import { type NextRequest, NextResponse } from "next/server"
import { obterProduto, atualizarProduto, excluirProduto } from "@/services/produtos"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const produto = await obterProduto(id)

    return NextResponse.json(produto)
  } catch (error) {
    console.error("Erro ao obter produto:", error)
    return NextResponse.json({ error: "Erro ao obter produto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const dadosProduto = await request.json()
    const produtoAtualizado = await atualizarProduto(id, dadosProduto)

    return NextResponse.json(produtoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await excluirProduto(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}
