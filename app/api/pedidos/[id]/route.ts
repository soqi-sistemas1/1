import { type NextRequest, NextResponse } from "next/server"
import { obterPedido, atualizarStatusPedido } from "@/services/pedidos"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const pedido = await obterPedido(id)

    return NextResponse.json(pedido)
  } catch (error) {
    console.error("Erro ao obter pedido:", error)
    return NextResponse.json({ error: "Erro ao obter pedido" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status não informado" }, { status: 400 })
    }

    const pedidoAtualizado = await atualizarStatusPedido(id, status)

    return NextResponse.json(pedidoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    return NextResponse.json({ error: "Erro ao atualizar status do pedido" }, { status: 500 })
  }
}
