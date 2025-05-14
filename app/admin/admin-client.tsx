"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatarPreco } from "@/lib/utils"
import {
  Package,
  ShoppingBag,
  Users,
  Map,
  Settings,
  Home,
  PlusCircle,
  Trash,
  Edit,
  Save,
  Palette,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { UploadImagem } from "@/components/upload-imagem"
import type { PedidoCompleto } from "@/services/pedidos"
import type { Produto } from "@/services/produtos"
import type { Categoria } from "@/services/categorias"
import type { Bairro } from "@/services/bairros"
import type { MetodoPagamento } from "@/services/metodos-pagamento"
import type { Configuracao } from "@/services/configuracoes"

interface AdminPageProps {
  pedidosIniciais: PedidoCompleto[]
  produtosIniciais: Produto[]
  categoriasIniciais: Categoria[]
  bairrosIniciais: Bairro[]
  metodosPagamentoIniciais: MetodoPagamento[]
  configuracoesIniciais: Configuracao
}

export default function AdminPage({
  pedidosIniciais,
  produtosIniciais,
  categoriasIniciais,
  bairrosIniciais,
  metodosPagamentoIniciais,
  configuracoesIniciais,
}: AdminPageProps) {
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("pedidos")
  const [pedidos, setPedidos] = useState(pedidosIniciais)
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [categorias, setCategorias] = useState(categoriasIniciais)
  const [bairros, setBairros] = useState(bairrosIniciais)
  const [metodoPagamento, setMetodoPagamento] = useState(metodosPagamentoIniciais)
  const [configuracoes, setConfiguracoes] = useState(configuracoesIniciais)
  const [carregando, setCarregando] = useState(false)

  const [editando, setEditando] = useState({
    tipo: "",
    id: null,
    dados: {},
    arquivos: {
      imagem: null,
      logo: null,
    },
  })

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleString("pt-BR")
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
        categoria_id: categorias[0]?.id || 1,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-gray-600">Logado como: {user.email}</span>}
            <Link href="/" className="text-blue-600 hover:underline flex items-center">
              <Home className="h-4 w-4 mr-1" /> Ver Site
            </Link>
            <Link href="/admin/personalizar" className="text-orange-500 hover:underline flex items-center">
              <Palette className="h-4 w-4 mr-1" /> Personalizar Tema
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
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
                              <div className="font-medium">{pedido.cliente.nome}</div>
                              <div className="text-sm text-gray-500">{pedido.cliente.telefone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatarData(pedido.created_at)}</TableCell>
                          <TableCell>{formatarPreco(pedido.total + pedido.taxa_entrega)}</TableCell>
                          <TableCell>
                            <select
                              value={pedido.status}
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

          {/* Conteúdo da aba Produtos */}
          <TabsContent value="produtos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Produtos</h2>
              <Button onClick={() => adicionarItem("produto")} disabled={carregando}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Produto
              </Button>
            </div>

            {editando.tipo === "produto" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editando.id ? "Editar Produto" : "Novo Produto"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Produto</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={editando.dados.nome || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoriaId">Categoria</Label>
                      <select
                        id="categoriaId"
                        name="categoria_id"
                        className="w-full p-2 border rounded-md"
                        value={editando.dados.categoria_id || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      >
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço</Label>
                      <Input
                        id="preco"
                        name="preco"
                        type="number"
                        step="0.01"
                        value={editando.dados.preco || 0}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ativo">Status</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          name="ativo"
                          checked={editando.dados.ativo}
                          onChange={handleInputChange}
                          disabled={carregando}
                        />
                        <label htmlFor="ativo">Ativo</label>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <textarea
                        id="descricao"
                        name="descricao"
                        className="w-full p-2 border rounded-md min-h-[80px]"
                        value={editando.dados.descricao || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Imagem do Produto</Label>
                      <UploadImagem
                        imagemAtual={editando.dados.imagem_url}
                        onImagemSelecionada={(arquivo) => handleImagemSelecionada("imagem", arquivo)}
                        altura={150}
                        largura={150}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={salvarEdicao} disabled={carregando}>
                      {carregando ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Salvando...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Salvar Produto
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelarEdicao} disabled={carregando}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                {carregando && !editando.tipo ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>{produto.id}</TableCell>
                          <TableCell>{produto.nome}</TableCell>
                          <TableCell>
                            {categorias.find((c) => c.id === produto.categoria_id)?.nome || "Sem categoria"}
                          </TableCell>
                          <TableCell>{formatarPreco(produto.preco)}</TableCell>
                          <TableCell>{produto.ativo ? "Ativo" : "Inativo"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("produto", produto.id, produto)}
                                disabled={carregando}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("produto", produto.id)}
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

          {/* Conteúdo da aba Categorias */}
          <TabsContent value="categorias" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Categorias</h2>
              <Button onClick={() => adicionarItem("categoria")} disabled={carregando}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Categoria
              </Button>
            </div>

            {editando.tipo === "categoria" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editando.id ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Categoria</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={editando.dados.nome || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ativo">Status</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          name="ativo"
                          checked={editando.dados.ativo}
                          onChange={handleInputChange}
                          disabled={carregando}
                        />
                        <label htmlFor="ativo">Ativo</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={salvarEdicao} disabled={carregando}>
                      {carregando ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Salvando...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Salvar Categoria
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelarEdicao} disabled={carregando}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                {carregando && !editando.tipo ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categorias.map((categoria) => (
                        <TableRow key={categoria.id}>
                          <TableCell>{categoria.id}</TableCell>
                          <TableCell>{categoria.nome}</TableCell>
                          <TableCell>{categoria.ativo ? "Ativo" : "Inativo"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("categoria", categoria.id, categoria)}
                                disabled={carregando}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("categoria", categoria.id)}
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

          {/* Conteúdo da aba Clientes */}
          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-4">
                  Funcionalidade em desenvolvimento. Os clientes são registrados automaticamente ao fazer pedidos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo da aba Entregas */}
          <TabsContent value="entregas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Bairros e Taxas</h2>
              <Button onClick={() => adicionarItem("bairro")} disabled={carregando}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Bairro
              </Button>
            </div>

            {editando.tipo === "bairro" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editando.id ? "Editar Bairro" : "Novo Bairro"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Bairro</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={editando.dados.nome || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxa">Taxa de Entrega</Label>
                      <Input
                        id="taxa"
                        name="taxa"
                        type="number"
                        step="0.01"
                        value={editando.dados.taxa || 0}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ativo">Status</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          name="ativo"
                          checked={editando.dados.ativo}
                          onChange={handleInputChange}
                          disabled={carregando}
                        />
                        <label htmlFor="ativo">Ativo</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={salvarEdicao} disabled={carregando}>
                      {carregando ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Salvando...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Salvar Bairro
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelarEdicao} disabled={carregando}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                {carregando && !editando.tipo ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Bairro</TableHead>
                        <TableHead>Taxa de Entrega</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bairros.map((bairro) => (
                        <TableRow key={bairro.id}>
                          <TableCell>{bairro.id}</TableCell>
                          <TableCell>{bairro.nome}</TableCell>
                          <TableCell>{formatarPreco(bairro.taxa)}</TableCell>
                          <TableCell>{bairro.ativo ? "Ativo" : "Inativo"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("bairro", bairro.id, bairro)}
                                disabled={carregando}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("bairro", bairro.id)}
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

            <div className="flex justify-between items-center mt-8">
              <h2 className="text-xl font-bold">Métodos de Pagamento</h2>
              <Button onClick={() => adicionarItem("metodoPagamento")} disabled={carregando}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Método
              </Button>
            </div>

            {editando.tipo === "metodoPagamento" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editando.id ? "Editar Método de Pagamento" : "Novo Método de Pagamento"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Método</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={editando.dados.nome || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (identificador)</Label>
                      <Input
                        id="valor"
                        name="valor"
                        value={editando.dados.valor || ""}
                        onChange={handleInputChange}
                        disabled={carregando}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ativo">Status</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          name="ativo"
                          checked={editando.dados.ativo}
                          onChange={handleInputChange}
                          disabled={carregando}
                        />
                        <label htmlFor="ativo">Ativo</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={salvarEdicao} disabled={carregando}>
                      {carregando ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Salvando...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Salvar Método
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={cancelarEdicao} disabled={carregando}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                {carregando && !editando.tipo ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metodoPagamento.map((metodo) => (
                        <TableRow key={metodo.id}>
                          <TableCell>{metodo.id}</TableCell>
                          <TableCell>{metodo.nome}</TableCell>
                          <TableCell>{metodo.valor}</TableCell>
                          <TableCell>{metodo.ativo ? "Ativo" : "Inativo"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("metodoPagamento", metodo.id, metodo)}
                                disabled={carregando}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("metodoPagamento", metodo.id)}
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

          {/* Conteúdo da aba Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editando.tipo === "configuracoes" ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome_estabelecimento">Nome do Estabelecimento</Label>
                          <Input
                            id="nome_estabelecimento"
                            name="nome_estabelecimento"
                            value={editando.dados.nome_estabelecimento || ""}
                            onChange={handleInputChange}
                            disabled={carregando}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telefone_whatsapp">Telefone WhatsApp</Label>
                          <Input
                            id="telefone_whatsapp"
                            name="telefone_whatsapp"
                            value={editando.dados.telefone_whatsapp || ""}
                            onChange={handleInputChange}
                            disabled={carregando}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endereco">Endereço</Label>
                          <Input
                            id="endereco"
                            name="endereco"
                            value={editando.dados.endereco || ""}
                            onChange={handleInputChange}
                            disabled={carregando}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="horario_funcionamento">Horário de Funcionamento</Label>
                          <Input
                            id="horario_funcionamento"
                            name="horario_funcionamento"
                            value={editando.dados.horario_funcionamento || ""}
                            onChange={handleInputChange}
                            disabled={carregando}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="envio_automatico_whatsapp">Envio Automático para WhatsApp</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="envio_automatico_whatsapp"
                              name="envio_automatico_whatsapp"
                              checked={editando.dados.envio_automatico_whatsapp}
                              onChange={handleInputChange}
                              disabled={carregando}
                            />
                            <label htmlFor="envio_automatico_whatsapp">
                              Enviar pedidos automaticamente para o WhatsApp
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Logo do Estabelecimento</Label>
                          <UploadImagem
                            imagemAtual={editando.dados.logo_url}
                            onImagemSelecionada={(arquivo) => handleImagemSelecionada("logo", arquivo)}
                            altura={100}
                            largura={200}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button onClick={salvarEdicao} disabled={carregando}>
                          {carregando ? (
                            <div className="flex items-center">
                              <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                              Salvando...
                            </div>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" /> Salvar Configurações
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={cancelarEdicao} disabled={carregando}>
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Nome do Estabelecimento</h3>
                          <p>{configuracoes.nome_estabelecimento}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Telefone WhatsApp</h3>
                          <p>{configuracoes.telefone_whatsapp}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Endereço</h3>
                          <p>{configuracoes.endereco}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Horário de Funcionamento</h3>
                          <p>{configuracoes.horario_funcionamento}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Envio Automático para WhatsApp</h3>
                          <p>{configuracoes.envio_automatico_whatsapp ? "Ativado" : "Desativado"}</p>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-semibold mb-2">Logo</h3>
                          <div className="border p-4 rounded-md inline-block">
                            <img src={configuracoes.logo_url || "/placeholder.svg"} alt="Logo" className="h-16" />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="mt-6"
                        onClick={() => iniciarEdicao("configuracoes", configuracoes.id, configuracoes)}
                        disabled={carregando}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Editar Configurações
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
