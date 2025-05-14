import { listarCategorias } from "@/services/categorias"
import { listarProdutos } from "@/services/produtos"
import { listarBairros } from "@/services/bairros"
import { listarMetodosPagamento } from "@/services/metodos-pagamento"
import { listarBanners } from "@/services/banners"
import { obterConfiguracoes } from "@/services/configuracoes"
import ClientePage from "./client-page"

export const revalidate = 60 // Revalidar a cada 60 segundos

export default async function Home() {
  // Carregar dados do banco de dados
  const [categorias, produtos, bairros, metodosPagamento, banners, configuracoes] = await Promise.all([
    listarCategorias(),
    listarProdutos(),
    listarBairros(),
    listarMetodosPagamento(),
    listarBanners(),
    obterConfiguracoes(),
  ])

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
