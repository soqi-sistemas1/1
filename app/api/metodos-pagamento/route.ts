import { type NextRequest, NextResponse } from "next/server"
import { listarMetodosPagamento, criarMetodoPagamento } from "@/services/metodos-pagamento"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const apenasAtivos = searchParams.get("ativos") !== "false"

    const metodosPagamento = await listarMetodosPagamento(apenasAtivos)

    return NextResponse.json(metodosPagamento)
  } catch (error) {
    console.error("Erro ao listar métodos de pagamento:", error)
    return NextResponse.json({ error: "Erro ao listar métodos de pagamento" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const metodoPagamento = await request.json()
    const novoMetodoPagamento = await criarMetodoPagamento(metodoPagamento)

    return NextResponse.json(novoMetodoPagamento)
  } catch (error) {
    console.error("Erro ao criar método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao criar método de pagamento" }, { status: 500 })
  }
}
