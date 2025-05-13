import { listarCategorias } from "@/services/categorias"
import { listarProdutos } from "@/services/produtos"
import { listarBairros } from "@/services/bairros"
import { listarMetodosPagamento } from "@/services/metodos-pagamento"
import { listarBanners } from "@/services/banners"
import { obterConfiguracoes } from "@/services/configuracoes"
import ClientePage from "./client-page"

export const dynamic = "force-dynamic"

export default async function Home() {
  // Carrega todos os dados necessários do banco de dados
  const [categorias, bairros, metodosPagamento, banners, configuracoes] = await Promise.all([
    listarCategorias(),
    listarBairros(),
    listarMetodosPagamento(),
    listarBanners(),
    obterConfiguracoes(),
  ])

  // Carrega os produtos da primeira categoria, se existir
  const produtos = categorias.length > 0 ? await listarProdutos(true) : []

  // Passa os dados para o componente cliente
  return (
    <ClientePage
      categorias={categorias}
      produtos={produtos}
      bairros={bairros}
      metodosPagamento={metodosPagamento}
      banners={banners}
      configuracoes={configuracoes}
    />
  )
}
