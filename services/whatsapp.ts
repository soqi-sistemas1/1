import type { PedidoCompleto } from "./pedidos"
import { formatarPreco } from "@/lib/utils"

/**
 * Formata um pedido para envio via WhatsApp
 */
export function formatarPedidoParaWhatsApp(pedido: PedidoCompleto): string {
  // Formatar os itens do pedido
  const itensFormatados = pedido.itens
    .map(
      (item) => `- ${item.quantidade}x ${item.produto.nome} (${formatarPreco(item.preco_unitario * item.quantidade)})`,
    )
    .join("\n")

  // Formatar o endereço se for entrega
  const enderecoFormatado = pedido.entrega
    ? `\n*Endereço de entrega:*\n${pedido.rua}, ${pedido.numero}\n${pedido.bairro}`
    : "\n*Retirada no local*"

  // Formatar observações se houver
  const observacoesFormatadas = pedido.observacoes ? `\n*Observações:* ${pedido.observacoes}` : ""

  // Montar a mensagem completa
  const mensagem = `
🍔 *NOVO PEDIDO #${pedido.id}* 🍔

*Cliente:* ${pedido.cliente.nome}
*Telefone:* ${pedido.cliente.telefone}

*Itens:*
${itensFormatados}

*Subtotal:* ${formatarPreco(pedido.total)}
${pedido.taxa_entrega > 0 ? `*Taxa de entrega:* ${formatarPreco(pedido.taxa_entrega)}` : ""}
*Total:* ${formatarPreco(pedido.total + pedido.taxa_entrega)}

*Forma de pagamento:* ${pedido.metodo_pagamento}
${enderecoFormatado}
${observacoesFormatadas}
`

  return mensagem.trim()
}

/**
 * Gera um link para enviar uma mensagem via WhatsApp
 */
export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  // Remover caracteres não numéricos do telefone
  const telefoneFormatado = telefone.replace(/\D/g, "")

  // Codificar a mensagem para URL
  const mensagemCodificada = encodeURIComponent(mensagem)

  // Gerar o link do WhatsApp
  return `https://api.whatsapp.com/send?phone=${telefoneFormatado}&text=${mensagemCodificada}`
}

/**
 * Envia um pedido para o WhatsApp (retorna o link para abrir o WhatsApp)
 */
export function enviarPedidoWhatsApp(pedido: PedidoCompleto, telefoneEstabelecimento: string): string {
  const mensagem = formatarPedidoParaWhatsApp(pedido)
  return gerarLinkWhatsApp(telefoneEstabelecimento, mensagem)
}
