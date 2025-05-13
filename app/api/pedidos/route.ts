import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const pedido = await request.json()

    // Aqui seria feita a lógica para salvar o pedido no banco de dados
    // e enviar notificação para o WhatsApp

    // Simulação de envio para WhatsApp
    console.log("Enviando pedido para WhatsApp:", pedido)

    // Em um sistema real, aqui seria feita a integração com a API do WhatsApp
    // Exemplo de mensagem que seria enviada:
    const mensagem = `
      🍔 *NOVO PEDIDO #${Date.now()}* 🍔
      
      *Cliente:* ${pedido.cliente.nome}
      *Telefone:* ${pedido.cliente.telefone}
      
      *Itens:*
      ${pedido.itens
        .map(
          (
            item,
          ) => `- ${item.quantidade}x ${item.nome} (${(item.preco * item.quantidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
      `,
        )
        .join("")}
      
      *Subtotal:* ${pedido.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      ${pedido.taxaEntrega > 0 ? `*Taxa de entrega:* ${pedido.taxaEntrega.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}
      *Total:* ${(pedido.total + pedido.taxaEntrega).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      
      *Forma de pagamento:* ${pedido.cliente.metodoPagamento}
      
      ${
        pedido.cliente.entrega
          ? `
      *Endereço de entrega:*
      ${pedido.cliente.rua}, ${pedido.cliente.numero}
      ${pedido.cliente.bairro}
      `
          : "*Retirada no local*"
      }
      
      ${pedido.cliente.observacoes ? `*Observações:* ${pedido.cliente.observacoes}` : ""}
    `

    console.log("Mensagem WhatsApp:", mensagem)

    return NextResponse.json({
      success: true,
      message: "Pedido recebido com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao processar pedido:", error)
    return NextResponse.json({ success: false, message: "Erro ao processar pedido" }, { status: 500 })
  }
}
