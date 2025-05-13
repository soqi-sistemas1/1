import { type NextRequest, NextResponse } from "next/server"
import { obterCategoria, atualizarCategoria, excluirCategoria } from "@/services/categorias"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const categoria = await obterCategoria(id)

    return NextResponse.json(categoria)
  } catch (error) {
    console.error("Erro ao obter categoria:", error)
    return NextResponse.json({ error: "Erro ao obter categoria" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const dadosCategoria = await request.json()
    const categoriaAtualizada = await atualizarCategoria(id, dadosCategoria)

    return NextResponse.json(categoriaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await excluirCategoria(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir categoria:", error)
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 })
  }
}
