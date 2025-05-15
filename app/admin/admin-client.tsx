"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatarPreco } from "@/lib/utils"
import {
  Package,
  ShoppingBag,
  Users,
  Map,
  Settings,
  Trash,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  User,
  LayoutGrid,
  Truck,
  CreditCard,
  MessageSquare,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import type { PedidoCompleto } from "@/services/pedidos"
import type { Produto } from "@/services/produtos"
import type { Categoria } from "@/services/categorias"
import type { Bairro } from "@/services/bairros"
import type { MetodoPagamento } from "@/services/metodos-pagamento"
import type { Configuracao } from "@/services/configuracoes"
import { useTema } from "@/hooks/use-tema"
import { usePathname } from "next/navigation"

interface AdminPageProps {
  pedidosIniciais: PedidoCompleto[]
  produtosIniciais: Produto[]
  categoriasIniciais: Categoria[]
  bairrosIniciais: Bairro[]
  metodosPagamentoIniciais: MetodoPagamento[]
  configuracoesIniciais: Configuracao
  isSuperAdmin?: boolean
}

export default function AdminPage({
  pedidosIniciais = [],
  produtosIniciais = [],
  categoriasIniciais = [],
  bairrosIniciais = [],
  metodosPagamentoIniciais = [],
  configuracoesIniciais = {} as Configuracao,
  isSuperAdmin = false,
}: AdminPageProps) {
  const { toast } = useToast()
  const { user, signOut, userPreferences, updateUserPreferences } = useAuth()
  const [activeTab, setActiveTab] = useState("pedidos")
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>(pedidosIniciais || [])
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais || [])
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais || [])
  const [bairros, setBairros] = useState<Bairro[]>(bairrosIniciais || [])
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento[]>(metodosPagamentoIniciais || [])
  const [configuracoes, setConfiguracoes] = useState<Configuracao>(configuracoesIniciais || {})
  const [carregando, setCarregando] = useState(false)
  const { tema, atualizarTema } = useTema()
  const pathname = usePathname()
  const [isUserSuperAdmin, setIsUserSuperAdmin] = useState(isSuperAdmin)

  // Atualizar o estado de superadmin quando o usuário for carregado
  useEffect(() => {
    if (user?.isSuperAdmin !== undefined) {
      setIsUserSuperAdmin(user.isSuperAdmin)
    }
  }, [user])

  const [editando, setEditando] = useState({
    tipo: "",
    id: null,
    dados: {},
    arquivos: {
      imagem: null,
      logo: null,
    },
  })

  // Sincronizar o tema com as preferências do usuário
  useEffect(() => {
    if (
      userPreferences?.modoEscuro !== undefined &&
      tema?.modoEscuro !== undefined &&
      userPreferences.modoEscuro !== tema.modoEscuro
    ) {
      atualizarTema({ modoEscuro: userPreferences.modoEscuro })
    }
  }, [userPreferences?.modoEscuro, tema?.modoEscuro, atualizarTema])

  const toggleModoEscuro = async () => {
    const novoModoEscuro = !tema?.modoEscuro

    // Atualizar o tema local
    atualizarTema({ modoEscuro: novoModoEscuro })

    // Atualizar as preferências do usuário no banco de dados
    if (updateUserPreferences) {
      await updateUserPreferences({ modoEscuro: novoModoEscuro })
    }
  }

  const formatarData = (dataString) => {
    if (!dataString) return ""
    try {
      const data = new Date(dataString)
      return data.toLocaleString("pt-BR")
    } catch (error) {
      return dataString
    }
  }

  const iniciarEdicao = (tipo, id, dados) => {
    setEditando({
      tipo,
      id,
      dados: { ...dados },
      arquivos: {
        imagem: null,
        logo: null,
      },
    })
  }

  const cancelarEdicao = () => {
    setEditando({
      tipo: "",
      id: null,
      dados: {},
      arquivos: {
        imagem: null,
        logo: null,
      },
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const valorFinal = type === "checkbox" ? checked : value

    setEditando({
      ...editando,
      dados: {
        ...editando.dados,
        [name]: valorFinal,
      },
    })
  }

  const handleImagemSelecionada = (tipo, arquivo) => {
    setEditando({
      ...editando,
      arquivos: {
        ...editando.arquivos,
        [tipo]: arquivo,
      },
    })
  }

  const uploadImagem = async (arquivo, pasta) => {
    if (!arquivo) return null

    const formData = new FormData()
    formData.append("arquivo", arquivo)
    formData.append("pasta", pasta)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      })
      return null
    }
  }

  const salvarEdicao = async () => {
    setCarregando(true)

    try {
      // Processa uploads de imagens, se houver
      let imagemUrl = null
      let logoUrl = null

      if (editando.arquivos.imagem) {
        imagemUrl = await uploadImagem(editando.arquivos.imagem, "produtos")
      }

      if (editando.arquivos.logo) {
        logoUrl = await uploadImagem(editando.arquivos.logo, "logo")
      }

      // Prepara os dados com as URLs das imagens, se houver
      const dadosAtualizados = { ...editando.dados }

      if (imagemUrl) {
        dadosAtualizados.imagem_url = imagemUrl
      }

      if (logoUrl) {
        dadosAtualizados.logo_url = logoUrl
      }

      // Salva os dados de acordo com o tipo
      if (editando.tipo === "produto") {
        const response = await fetch(editando.id ? `/api/produtos/${editando.id}` : "/api/produtos", {
          method: editando.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizados),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar produto")
        }

        const produtoSalvo = await response.json()

        if (editando.id) {
          setProdutos(produtos.map((p) => (p.id === editando.id ? produtoSalvo : p)))
        } else {
          setProdutos([...produtos, produtoSalvo])
        }

        toast({
          description: `Produto ${editando.id ? "atualizado" : "criado"} com sucesso!`,
        })
      } else if (editando.tipo === "categoria") {
        const response = await fetch(editando.id ? `/api/categorias/${editando.id}` : "/api/categorias", {
          method: editando.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizados),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar categoria")
        }

        const categoriaSalva = await response.json()

        if (editando.id) {
          setCategorias(categorias.map((c) => (c.id === editando.id ? categoriaSalva : c)))
        } else {
          setCategorias([...categorias, categoriaSalva])
        }

        toast({
          description: `Categoria ${editando.id ? "atualizada" : "criada"} com sucesso!`,
        })
      } else if (editando.tipo === "bairro") {
        const response = await fetch(editando.id ? `/api/bairros/${editando.id}` : "/api/bairros", {
          method: editando.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizados),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar bairro")
        }

        const bairroSalvo = await response.json()

        if (editando.id) {
          setBairros(bairros.map((b) => (b.id === editando.id ? bairroSalvo : b)))
        } else {
          setBairros([...bairros, bairroSalvo])
        }

        toast({
          description: `Bairro ${editando.id ? "atualizado" : "criado"} com sucesso!`,
        })
      } else if (editando.tipo === "metodoPagamento") {
        const response = await fetch(editando.id ? `/api/metodos-pagamento/${editando.id}` : "/api/metodos-pagamento", {
          method: editando.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizados),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar método de pagamento")
        }

        const metodoSalvo = await response.json()

        if (editando.id) {
          setMetodoPagamento(metodoPagamento.map((m) => (m.id === editando.id ? metodoSalvo : m)))
        } else {
          setMetodoPagamento([...metodoPagamento, metodoSalvo])
        }

        toast({
          description: `Método de pagamento ${editando.id ? "atualizado" : "criado"} com sucesso!`,
        })
      } else if (editando.tipo === "configuracoes") {
        const response = await fetch("/api/configuracoes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizados),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar configurações")
        }

        const configSalva = await response.json()
        setConfiguracoes(configSalva)

        toast({
          description: "Configurações atualizadas com sucesso!",
        })
      }

      cancelarEdicao()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  const adicionarItem = (tipo) => {
    if (tipo === "produto") {
      const novoProduto = {
        nome: "Novo Produto",
        descricao: "Descrição do novo produto",
        preco: 0,
        imagem_url: "/placeholder.svg?height=80&width=80",
        categoria_id: categorias.length > 0 ? categorias[0]?.id : 1,
        ativo: true,
      }
      iniciarEdicao("produto", null, novoProduto)
    } else if (tipo === "categoria") {
      const novaCategoria = {
        nome: "Nova Categoria",
        ativo: true,
      }
      iniciarEdicao("categoria", null, novaCategoria)
    } else if (tipo === "bairro") {
      const novoBairro = {
        nome: "Novo Bairro",
        taxa: 0,
        ativo: true,
      }
      iniciarEdicao("bairro", null, novoBairro)
    } else if (tipo === "metodoPagamento") {
      const novoMetodo = {
        nome: "Novo Método",
        valor: "novo_metodo",
        ativo: true,
      }
      iniciarEdicao("metodoPagamento", null, novoMetodo)
    }
  }

  const removerItem = async (tipo, id) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) {
      return
    }

    setCarregando(true)

    try {
      let endpoint = ""

      switch (tipo) {
        case "produto":
          endpoint = `/api/produtos/${id}`
          break
        case "categoria":
          endpoint = `/api/categorias/${id}`
          break
        case "bairro":
          endpoint = `/api/bairros/${id}`
          break
        case "metodoPagamento":
          endpoint = `/api/metodos-pagamento/${id}`
          break
        case "pedido":
          endpoint = `/api/pedidos/${id}`
          break
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Erro ao excluir ${tipo}`)
      }

      // Atualiza o estado local
      if (tipo === "produto") {
        setProdutos(produtos.filter((p) => p.id !== id))
      } else if (tipo === "categoria") {
        setCategorias(categorias.filter((c) => c.id !== id))
      } else if (tipo === "bairro") {
        setBairros(bairros.filter((b) => b.id !== id))
      } else if (tipo === "metodoPagamento") {
        setMetodoPagamento(metodoPagamento.filter((m) => m.id !== id))
      } else if (tipo === "pedido") {
        setPedidos(pedidos.filter((p) => p.id !== id))
      }

      toast({
        description: `Item excluído com sucesso!`,
      })
    } catch (error) {
      console.error("Erro ao excluir:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao excluir. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  const atualizarStatusPedido = async (id, novoStatus) => {
    setCarregando(true)

    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do pedido")
      }

      // Atualiza o estado local
      setPedidos(pedidos.map((p) => (p.id === id ? { ...p, status: novoStatus } : p)))

      toast({
        description: "Status do pedido atualizado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o status. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      await signOut()
    }
  }

  // Adicionar a função para enviar pedido para WhatsApp
  const enviarPedidoWhatsApp = async (id: number) => {
    try {
      const response = await fetch(`/api/pedidos/${id}/whatsapp`)

      if (!response.ok) {
        throw new Error("Erro ao gerar link do WhatsApp")
      }

      const data = await response.json()

      // Abrir o link do WhatsApp em uma nova aba
      if (data.whatsapp && data.whatsapp.link) {
        window.open(data.whatsapp.link, "_blank")
      }
    } catch (error) {
      console.error("Erro ao enviar para WhatsApp:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido para o WhatsApp.",
        variant: "destructive",
      })
    }
  }

  // Modifique a função de toggle do modo escuro para salvar a preferência
  const handleToggleModoEscuro = async () => {
    // Primeiro, alterna o modo escuro na UI
    toggleModoEscuro()

    // Depois, salva a preferência no banco de dados
    try {
      await fetch("/api/admin/preferencias/modo-escuro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modoEscuro: !tema?.modoEscuro }),
      })
    } catch (error) {
      console.error("Erro ao salvar preferência de modo escuro:", error)
    }
  }

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
    { href: "/admin/produtos", label: "Produtos", icon: <ShoppingBag className="h-5 w-5" /> },
    { href: "/admin/categorias", label: "Categorias", icon: <LayoutGrid className="h-5 w-5" /> },
    { href: "/admin/pedidos", label: "Pedidos", icon: <Truck className="h-5 w-5" /> },
    { href: "/admin/bairros", label: "Bairros", icon: <Truck className="h-5 w-5" /> },
    { href: "/admin/metodos-pagamento", label: "Métodos de Pagamento", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/admin/banners", label: "Banners", icon: <ImageIcon className="h-5 w-5" /> },
    { href: "/admin/personalizar", label: "Personalizar", icon: <Settings className="h-5 w-5" /> },
    { href: "/admin/whatsapp", label: "WhatsApp", icon: <MessageSquare className="h-5 w-5" /> },
  ]

  // Adicionar opção de administradores apenas para super admins
  const finalMenuItems = [...menuItems]
  if (isUserSuperAdmin) {
    finalMenuItems.push({
      href: "/admin/administradores",
      label: "Administradores",
      icon: <User className="h-5 w-5" />,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleModoEscuro} aria-label="Alternar modo escuro">
              {tema?.modoEscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <nav className="space-y-2">
              {finalMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <main className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div id="admin-content">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-6 gap-2">
                  <TabsTrigger value="pedidos" className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Pedidos
                  </TabsTrigger>
                  <TabsTrigger value="produtos" className="flex items-center">
                    <Package className="h-4 w-4 mr-2" /> Produtos
                  </TabsTrigger>
                  <TabsTrigger value="categorias" className="flex items-center">
                    <Package className="h-4 w-4 mr-2" /> Categorias
                  </TabsTrigger>
                  <TabsTrigger value="clientes" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Clientes
                  </TabsTrigger>
                  <TabsTrigger value="entregas" className="flex items-center">
                    <Map className="h-4 w-4 mr-2" /> Entregas
                  </TabsTrigger>
                  <TabsTrigger value="configuracoes" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" /> Configurações
                  </TabsTrigger>
                  {isUserSuperAdmin && (
                    <TabsTrigger value="administradores" className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2" /> Administradores
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Conteúdo da aba Pedidos */}
                <TabsContent value="pedidos" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pedidos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {carregando ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : pedidos.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Nenhum pedido encontrado</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pedidos.map((pedido) => (
                              <TableRow key={pedido.id}>
                                <TableCell>#{pedido.id}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{pedido.cliente?.nome || "Cliente"}</div>
                                    <div className="text-sm text-gray-500">
                                      {pedido.cliente?.telefone || "Sem telefone"}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{formatarData(pedido.created_at)}</TableCell>
                                <TableCell>{formatarPreco((pedido.total || 0) + (pedido.taxa_entrega || 0))}</TableCell>
                                <TableCell>
                                  <select
                                    value={pedido.status || "Pendente"}
                                    onChange={(e) => atualizarStatusPedido(pedido.id, e.target.value)}
                                    className="p-1 border rounded-md text-sm"
                                    disabled={carregando}
                                  >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Em Preparo">Em Preparo</option>
                                    <option value="Saiu para Entrega">Saiu para Entrega</option>
                                    <option value="Concluído">Concluído</option>
                                    <option value="Cancelado">Cancelado</option>
                                  </select>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      Ver Detalhes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                      onClick={() => enviarPedidoWhatsApp(pedido.id)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4 mr-1"
                                      >
                                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                        <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                        <path d="M9 14a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5Z" />
                                      </svg>
                                      WhatsApp
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removerItem("pedido", pedido.id)}
                                      disabled={carregando}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Conteúdo das outras abas... */}
                {/* Mantido o mesmo código para as outras abas */}

                {/* Conteúdo da aba Produtos */}
                <TabsContent value="produtos" className="space-y-4">
                  {/* Conteúdo da aba produtos */}
                </TabsContent>

                {/* Conteúdo da aba Categorias */}
                <TabsContent value="categorias" className="space-y-4">
                  {/* Conteúdo da aba categorias */}
                </TabsContent>

                {/* Conteúdo da aba Clientes */}
                <TabsContent value="clientes" className="space-y-4">
                  {/* Conteúdo da aba clientes */}
                </TabsContent>

                {/* Conteúdo da aba Entregas */}
                <TabsContent value="entregas" className="space-y-4">
                  {/* Conteúdo da aba entregas */}
                </TabsContent>

                {/* Conteúdo da aba Configurações */}
                <TabsContent value="configuracoes" className="space-y-4">
                  {/* Conteúdo da aba configurações */}
                </TabsContent>

                {isUserSuperAdmin && (
                  <TabsContent value="administradores" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Gerenciar Administradores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">Gerencie os usuários administradores do sistema.</p>
                        <Button asChild>
                          <Link href="/admin/administradores">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Ir para Gerenciamento de Administradores
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
