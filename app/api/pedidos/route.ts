import { type NextRequest, NextResponse } from "next/server"
import { listarPedidos, criarPedido } from "@/services/pedidos"
import { obterConfiguracoes } from "@/services/configuracoes"
import { formatarPedidoParaWhatsApp, gerarLinkWhatsApp } from "@/services/whatsapp"

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

    // Obter as configurações para pegar o telefone do estabelecimento
    const configuracoes = await obterConfiguracoes()

    // Formatar a mensagem para o WhatsApp
    const mensagemWhatsApp = formatarPedidoParaWhatsApp(novoPedido)

    // Gerar o link do WhatsApp
    const linkWhatsApp = gerarLinkWhatsApp(configuracoes.telefone_whatsapp, mensagemWhatsApp)

    console.log("Mensagem WhatsApp:", mensagemWhatsApp)

    return NextResponse.json({
      success: true,
      message: "Pedido recebido com sucesso!",
      pedido: novoPedido,
      whatsapp: {
        link: linkWhatsApp,
        mensagem: mensagemWhatsApp,
      },
    })
  } catch (error) {
    console.error("Erro ao processar pedido:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao processar pedido", error: error.message },
      { status: 500 },
    )
  }
}
