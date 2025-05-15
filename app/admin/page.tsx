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
    listarPedidos(),
    listarProdutos(false),
    listarCategorias(false),
    listarBairros(false),
    listarMetodosPagamento(false),
    obterConfiguracoes(),
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
      pedidos={pedidos}
      produtos={produtos}
      categorias={categorias}
      bairros={bairros}
      metodosPagamento={metodosPagamento}
      configuracoes={configuracoes}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
