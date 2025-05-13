import { createServerSupabaseClient } from "@/lib/supabase"

export type Cliente = {
  id: number
  nome: string
  telefone: string
  created_at: string
}

export type Pedido = {
  id: number
  cliente_id: number
  total: number
  taxa_entrega: number
  metodo_pagamento: string
  status: string
  entrega: boolean
  rua?: string
  numero?: string
  bairro?: string
  observacoes?: string
  created_at: string
}

export type ItemPedido = {
  id: number
  pedido_id: number
  produto_id: number
  quantidade: number
  preco_unitario: number
  created_at: string
}

export type PedidoCompleto = Pedido & {
  cliente: Cliente
  itens: (ItemPedido & { produto: { nome: string } })[]
}

export async function listarPedidos(status?: string) {
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from("pedidos")
    .select(`
      *,
      cliente:cliente_id(id, nome, telefone),
      itens:itens_pedido(
        id, 
        quantidade, 
        preco_unitario,
        produto:produto_id(id, nome)
      )
    `)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao listar pedidos:", error)
    throw new Error("Não foi possível carregar os pedidos")
  }

  return data as PedidoCompleto[]
}

export async function obterPedido(id: number) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      cliente:cliente_id(id, nome, telefone),
      itens:itens_pedido(
        id, 
        quantidade, 
        preco_unitario,
        produto:produto_id(id, nome)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao obter pedido:", error)
    throw new Error("Não foi possível carregar o pedido")
  }

  return data as PedidoCompleto
}

export async function criarPedido(
  dadosCliente: { nome: string; telefone: string },
  dadosPedido: Omit<Pedido, "id" | "cliente_id" | "created_at">,
  itensPedido: { produto_id: number; quantidade: number; preco_unitario: number }[],
) {
  const supabase = createServerSupabaseClient()

  // Inicia uma transação
  const { error: errorTransaction } = await supabase.rpc("begin_transaction")
  if (errorTransaction) {
    console.error("Erro ao iniciar transação:", errorTransaction)
    throw new Error("Não foi possível iniciar a transação")
  }

  try {
    // 1. Cria ou obtém o cliente
    let clienteId

    // Verifica se o cliente já existe pelo telefone
    const { data: clienteExistente } = await supabase
      .from("clientes")
      .select("id")
      .eq("telefone", dadosCliente.telefone)
      .limit(1)

    if (clienteExistente && clienteExistente.length > 0) {
      clienteId = clienteExistente[0].id

      // Atualiza o nome do cliente se necessário
      await supabase.from("clientes").update({ nome: dadosCliente.nome }).eq("id", clienteId)
    } else {
      // Cria um novo cliente
      const { data: novoCliente, error: errorCliente } = await supabase
        .from("clientes")
        .insert(dadosCliente)
        .select("id")
        .single()

      if (errorCliente) {
        throw new Error("Erro ao criar cliente: " + errorCliente.message)
      }

      clienteId = novoCliente.id
    }

    // 2. Cria o pedido
    const { data: novoPedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({ ...dadosPedido, cliente_id: clienteId })
      .select("id")
      .single()

    if (errorPedido) {
      throw new Error("Erro ao criar pedido: " + errorPedido.message)
    }

    const pedidoId = novoPedido.id

    // 3. Cria os itens do pedido
    const itensComPedidoId = itensPedido.map((item) => ({
      ...item,
      pedido_id: pedidoId,
    }))

    const { error: errorItens } = await supabase.from("itens_pedido").insert(itensComPedidoId)

    if (errorItens) {
      throw new Error("Erro ao criar itens do pedido: " + errorItens.message)
    }

    // Finaliza a transação
    const { error: errorCommit } = await supabase.rpc("commit_transaction")
    if (errorCommit) {
      throw new Error("Erro ao finalizar transação: " + errorCommit.message)
    }

    // Retorna o pedido completo
    return await obterPedido(pedidoId)
  } catch (error) {
    // Reverte a transação em caso de erro
    await supabase.rpc("rollback_transaction")
    console.error("Erro ao criar pedido:", error)
    throw error
  }
}

export async function atualizarStatusPedido(id: number, status: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("pedidos").update({ status }).eq("id", id).select().single()

  if (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    throw new Error("Não foi possível atualizar o status do pedido")
  }

  return data as Pedido
}
