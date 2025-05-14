import { listarPedidos } from "@/services/pedidos"
import { listarProdutos } from "@/services/produtos"
import { listarCategorias } from "@/services/categorias"
import { listarBairros } from "@/services/bairros"
import { listarMetodosPagamento } from "@/services/metodos-pagamento"
import { obterConfiguracoes } from "@/services/configuracoes"
import AdminPage from "./admin-client"

export const revalidate = 60 // Revalidar a cada 60 segundos

export default async function Admin() {
  // Carregar dados do banco de dados
  const [pedidos, produtos, categorias, bairros, metodosPagamento, configuracoes] = await Promise.all([
    listarPedidos(),
    listarProdutos(false),
    listarCategorias(false),
    listarBairros(false),
    listarMetodosPagamento(false),
    obterConfiguracoes(),
  ])

  return (
    <AdminPage
      pedidosIniciais={pedidos}
      produtosIniciais={produtos}
      categoriasIniciais={categorias}
      bairrosIniciais={bairros}
      metodosPagamentoIniciais={metodosPagamento}
      configuracoesIniciais={configuracoes}
    />
  )
}
