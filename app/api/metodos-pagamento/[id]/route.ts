import { type NextRequest, NextResponse } from "next/server"
import { obterMetodoPagamento, atualizarMetodoPagamento } from "@/services/metodos-pagamento"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const metodoPagamento = await obterMetodoPagamento(id)

    return NextResponse.json(metodoPagamento)
  } catch (error) {
    console.error("Erro ao obter método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao obter método de pagamento" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const dadosMetodoPagamento = await request.json()
    const metodoPagamentoAtualizado = await atualizarMetodoPagamento(id, dadosMetodoPagamento)

    return NextResponse.json(metodoPagamentoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao atualizar método de pagamento" }, { status: 500 })
  }
}
