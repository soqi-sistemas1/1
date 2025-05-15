import { listarPedidos } from "@/services/pedidos"
import { listarProdutos } from "@/services/produtos"
import { listarCategorias } from "@/services/categorias"
import { listarBairros } from "@/services/bairros"
import { listarMetodosPagamento } from "@/services/metodos-pagamento"
import { obterConfiguracoes } from "@/services/configuracoes"
import { createServerSupabaseClient } from "@/lib/supabase"
import AdminPage from "./admin-client"

export const revalidate = 60 // Revalidar a cada 60 segundos

export default async function Admin() {
  // Carregar dados do banco de dados
  const [pedidos, produtos, categorias, bairros, metodosPagamento, configuracoes] = await Promise.all([
    listarPedidos().catch(() => []),
    listarProdutos(false).catch(() => []),
    listarCategorias(false).catch(() => []),
    listarBairros(false).catch(() => []),
    listarMetodosPagamento(false).catch(() => []),
    obterConfiguracoes().catch(() => ({})),
  ])

  // Verificar se o usuário é super admin
  let isSuperAdmin = false
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: adminData } = await supabase
        .from("administradores")
        .select("super_admin")
        .eq("user_id", session.user.id)
        .single()

      if (adminData?.super_admin) {
        isSuperAdmin = true
      }
    }
  } catch (error) {
    console.error("Erro ao verificar super admin:", error)
  }

  return (
    <AdminPage
      pedidosIniciais={pedidos || []}
      produtosIniciais={produtos || []}
      categoriasIniciais={categorias || []}
      bairrosIniciais={bairros || []}
      metodosPagamentoIniciais={metodosPagamento || []}
      configuracoesIniciais={configuracoes || {}}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
