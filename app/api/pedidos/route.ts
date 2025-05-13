import { type NextRequest, NextResponse } from "next/server"
import { listarPedidos, criarPedido } from "@/services/pedidos"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const pedidos = await listarPedidos(status || undefined)

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error("Erro ao listar pedidos:", error)
    return NextResponse.json({ error: "Erro ao listar pedidos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cliente, pedido, itens } = await request.json()

    const novoPedido = await criarPedido(cliente, pedido, itens)

    // Aqui seria feita a integração com o WhatsApp
    // Exemplo de mensagem que seria enviada:
    const mensagem = `
      🍔 *NOVO PEDIDO #${novoPedido.id}* 🍔
      
      *Cliente:* ${novoPedido.cliente.nome}
      *Telefone:* ${novoPedido.cliente.telefone}
      
      *Itens:*
      ${novoPedido.itens
        .map(
          (
            item,
          ) => `- ${item.quantidade}x ${item.produto.nome} (${(item.preco_unitario * item.quantidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
      `,
        )
        .join("")}
      
      *Subtotal:* ${novoPedido.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      ${novoPedido.taxa_entrega > 0 ? `*Taxa de entrega:* ${novoPedido.taxa_entrega.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}
      *Total:* ${(novoPedido.total + novoPedido.taxa_entrega).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      
      *Forma de pagamento:* ${novoPedido.metodo_pagamento}
      
      ${
        novoPedido.entrega
          ? `
      *Endereço de entrega:*
      ${novoPedido.rua}, ${novoPedido.numero}
      ${novoPedido.bairro}
      `
          : "*Retirada no local*"
      }
      
      ${novoPedido.observacoes ? `*Observações:* ${novoPedido.observacoes}` : ""}
    `

    console.log("Mensagem WhatsApp:", mensagem)

    return NextResponse.json({
      success: true,
      message: "Pedido recebido com sucesso!",
      pedido: novoPedido,
    })
  } catch (error) {
    console.error("Erro ao processar pedido:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao processar pedido", error: error.message },
      { status: 500 },
    )
  }
}
