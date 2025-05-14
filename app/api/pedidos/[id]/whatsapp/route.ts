import { type NextRequest, NextResponse } from "next/server"
import { obterPedido } from "@/services/pedidos"
import { obterConfiguracoes } from "@/services/configuracoes"
import { formatarPedidoParaWhatsApp, gerarLinkWhatsApp } from "@/services/whatsapp"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const pedido = await obterPedido(id)
    const configuracoes = await obterConfiguracoes()

    const mensagem = formatarPedidoParaWhatsApp(pedido)
    const link = gerarLinkWhatsApp(configuracoes.telefone_whatsapp, mensagem)

    return NextResponse.json({
      success: true,
      whatsapp: {
        link,
        mensagem,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar link do WhatsApp:", error)
    return NextResponse.json({ error: "Erro ao gerar link do WhatsApp" }, { status: 500 })
  }
}
