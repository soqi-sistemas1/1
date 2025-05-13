import { type NextRequest, NextResponse } from "next/server"
import { obterBairro, atualizarBairro, excluirBairro } from "@/services/bairros"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const bairro = await obterBairro(id)

    return NextResponse.json(bairro)
  } catch (error) {
    console.error("Erro ao obter bairro:", error)
    return NextResponse.json({ error: "Erro ao obter bairro" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const dadosBairro = await request.json()
    const bairroAtualizado = await atualizarBairro(id, dadosBairro)

    return NextResponse.json(bairroAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar bairro:", error)
    return NextResponse.json({ error: "Erro ao atualizar bairro" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await excluirBairro(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir bairro:", error)
    return NextResponse.json({ error: "Erro ao excluir bairro" }, { status: 500 })
  }
}
