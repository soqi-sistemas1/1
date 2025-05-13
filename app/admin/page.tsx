"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatarPreco } from "@/lib/utils"
// Adicione o import para o ícone Palette
import { Package, ShoppingBag, Users, Map, Settings, Home, PlusCircle, Trash, Edit, Save, Palette } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("pedidos")
  const [pedidos, setPedidos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [bairros, setBairros] = useState([])
  const [metodoPagamento, setMetodoPagamento] = useState([])
  const [configuracoes, setConfiguracoes] = useState({
    nomeEstabelecimento: "Lanchonete Delícia",
    telefoneWhatsapp: "(00) 00000-0000",
    endereco: "Rua Exemplo, 123 - Centro",
    horarioFuncionamento: "Segunda a Domingo: 18h às 23h",
    logoUrl: "/placeholder.svg?height=60&width=200",
  })

  const [editando, setEditando] = useState({
    tipo: "",
    id: null,
    dados: {},
  })

  useEffect(() => {
    // Simulação de carregamento de dados
    // Em um sistema real, estes dados viriam de uma API
    const carregarDados = () => {
      // Pedidos simulados
      const pedidosData = [
        {
          id: 1,
          cliente: {
            nome: "João Silva",
            telefone: "(11) 98765-4321",
            entrega: true,
            rua: "Rua das Flores",
            numero: "123",
            bairro: "Centro",
          },
          itens: [
            { id: 1, nome: "X-Tudo", preco: 25.9, quantidade: 2 },
            { id: 4, nome: "Refrigerante Cola", preco: 5.9, quantidade: 2 },
          ],
          total: 63.6,
          taxaEntrega: 5.0,
          metodoPagamento: "Dinheiro",
          status: "Pendente",
          data: "2023-06-10T19:30:00",
        },
        {
          id: 2,
          cliente: {
            nome: "Maria Oliveira",
            telefone: "(11) 91234-5678",
            entrega: false,
          },
          itens: [{ id: 3, nome: "Pizza Calabresa", preco: 45.9, quantidade: 1 }],
          total: 45.9,
          taxaEntrega: 0,
          metodoPagamento: "PIX",
          status: "Concluído",
          data: "2023-06-10T18:15:00",
        },
      ]

      // Produtos simulados
      const produtosData = [
        {
          id: 1,
          nome: "X-Tudo",
          descricao: "Hambúrguer com tudo que tem direito",
          preco: 25.9,
          imagem: "/placeholder.svg?height=80&width=80",
          categoriaId: 1,
          ativo: true,
        },
        {
          id: 2,
          nome: "X-Salada",
          descricao: "Hambúrguer com salada",
          preco: 18.9,
          imagem: "/placeholder.svg?height=80&width=80",
          categoriaId: 1,
          ativo: true,
        },
        {
          id: 3,
          nome: "Pizza Calabresa",
          descricao: "Pizza de calabresa com queijo",
          preco: 45.9,
          imagem: "/placeholder.svg?height=80&width=80",
          categoriaId: 2,
          ativo: true,
        },
        {
          id: 4,
          nome: "Refrigerante Cola",
          descricao: "Refrigerante sabor cola 350ml",
          preco: 5.9,
          imagem: "/placeholder.svg?height=80&width=80",
          categoriaId: 3,
          ativo: true,
        },
        {
          id: 5,
          nome: "Sorvete",
          descricao: "Sorvete de chocolate",
          preco: 10.9,
          imagem: "/placeholder.svg?height=80&width=80",
          categoriaId: 4,
          ativo: true,
        },
      ]

      // Categorias simuladas
      const categoriasData = [
        { id: 1, nome: "Hambúrgueres", ativo: true },
        { id: 2, nome: "Pizzas", ativo: true },
        { id: 3, nome: "Bebidas", ativo: true },
        { id: 4, nome: "Sobremesas", ativo: true },
      ]

      // Bairros simulados
      const bairrosData = [
        { id: 1, nome: "Centro", taxa: 5.0, ativo: true },
        { id: 2, nome: "Jardim América", taxa: 7.0, ativo: true },
        { id: 3, nome: "Vila Nova", taxa: 8.0, ativo: true },
      ]

      // Métodos de pagamento simulados
      const metodoPagamentoData = [
        { id: 1, nome: "Dinheiro", valor: "dinheiro", ativo: true },
        { id: 2, nome: "Cartão de Crédito", valor: "credito", ativo: true },
        { id: 3, nome: "Cartão de Débito", valor: "debito", ativo: true },
        { id: 4, nome: "PIX", valor: "pix", ativo: true },
      ]

      setPedidos(pedidosData)
      setProdutos(produtosData)
      setCategorias(categoriasData)
      setBairros(bairrosData)
      setMetodoPagamento(metodoPagamentoData)
    }

    carregarDados()
  }, [])

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleString("pt-BR")
  }

  const iniciarEdicao = (tipo, id, dados) => {
    setEditando({
      tipo,
      id,
      dados: { ...dados },
    })
  }

  const cancelarEdicao = () => {
    setEditando({
      tipo: "",
      id: null,
      dados: {},
    })
  }

  const salvarEdicao = () => {
    // Em um sistema real, aqui seria feita uma chamada para a API
    // para salvar as alterações no banco de dados

    if (editando.tipo === "produto") {
      setProdutos(produtos.map((p) => (p.id === editando.id ? { ...p, ...editando.dados } : p)))
    } else if (editando.tipo === "categoria") {
      setCategorias(categorias.map((c) => (c.id === editando.id ? { ...c, ...editando.dados } : c)))
    } else if (editando.tipo === "bairro") {
      setBairros(bairros.map((b) => (b.id === editando.id ? { ...b, ...editando.dados } : b)))
    } else if (editando.tipo === "metodoPagamento") {
      setMetodoPagamento(metodoPagamento.map((m) => (m.id === editando.id ? { ...m, ...editando.dados } : m)))
    } else if (editando.tipo === "configuracoes") {
      setConfiguracoes({ ...configuracoes, ...editando.dados })
    }

    cancelarEdicao()
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

  const adicionarItem = (tipo) => {
    // Em um sistema real, aqui seria feita uma chamada para a API
    // para adicionar o item no banco de dados

    if (tipo === "produto") {
      const novoProduto = {
        id: produtos.length + 1,
        nome: "Novo Produto",
        descricao: "Descrição do novo produto",
        preco: 0,
        imagem: "/placeholder.svg?height=80&width=80",
        categoriaId: categorias[0]?.id || 1,
        ativo: true,
      }
      setProdutos([...produtos, novoProduto])
      iniciarEdicao("produto", novoProduto.id, novoProduto)
    } else if (tipo === "categoria") {
      const novaCategoria = {
        id: categorias.length + 1,
        nome: "Nova Categoria",
        ativo: true,
      }
      setCategorias([...categorias, novaCategoria])
      iniciarEdicao("categoria", novaCategoria.id, novaCategoria)
    } else if (tipo === "bairro") {
      const novoBairro = {
        id: bairros.length + 1,
        nome: "Novo Bairro",
        taxa: 0,
        ativo: true,
      }
      setBairros([...bairros, novoBairro])
      iniciarEdicao("bairro", novoBairro.id, novoBairro)
    } else if (tipo === "metodoPagamento") {
      const novoMetodo = {
        id: metodoPagamento.length + 1,
        nome: "Novo Método",
        valor: "novo_metodo",
        ativo: true,
      }
      setMetodoPagamento([...metodoPagamento, novoMetodo])
      iniciarEdicao("metodoPagamento", novoMetodo.id, novoMetodo)
    }
  }

  const removerItem = (tipo, id) => {
    // Em um sistema real, aqui seria feita uma chamada para a API
    // para remover o item do banco de dados

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
  }

  const atualizarStatusPedido = (id, novoStatus) => {
    // Em um sistema real, aqui seria feita uma chamada para a API
    // para atualizar o status do pedido no banco de dados

    setPedidos(pedidos.map((p) => (p.id === id ? { ...p, status: novoStatus } : p)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>
          {/* Adicione o link para a página de personalização no cabeçalho, logo após o link "Ver Site" */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:underline flex items-center">
              <Home className="h-4 w-4 mr-1" /> Ver Site
            </Link>
            <Link href="/admin/personalizar" className="text-orange-500 hover:underline flex items-center">
              <Palette className="h-4 w-4 mr-1" /> Personalizar Tema
            </Link>
            <Button variant="outline" size="sm">
              Sair
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
                {pedidos.length === 0 ? (
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
                          <TableCell>{formatarData(pedido.data)}</TableCell>
                          <TableCell>{formatarPreco(pedido.total + pedido.taxaEntrega)}</TableCell>
                          <TableCell>
                            <select
                              value={pedido.status}
                              onChange={(e) => atualizarStatusPedido(pedido.id, e.target.value)}
                              className="p-1 border rounded-md text-sm"
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
                              <Button variant="destructive" size="sm" onClick={() => removerItem("pedido", pedido.id)}>
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
              <Button onClick={() => adicionarItem("produto")}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Produto
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
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
                        <TableCell>
                          {editando.tipo === "produto" && editando.id === produto.id ? (
                            <Input name="nome" value={editando.dados.nome || ""} onChange={handleInputChange} />
                          ) : (
                            produto.nome
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "produto" && editando.id === produto.id ? (
                            <select
                              name="categoriaId"
                              value={editando.dados.categoriaId || ""}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded-md"
                            >
                              {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.nome}
                                </option>
                              ))}
                            </select>
                          ) : (
                            categorias.find((c) => c.id === produto.categoriaId)?.nome || "Sem categoria"
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "produto" && editando.id === produto.id ? (
                            <Input
                              name="preco"
                              type="number"
                              step="0.01"
                              value={editando.dados.preco || 0}
                              onChange={handleInputChange}
                            />
                          ) : (
                            formatarPreco(produto.preco)
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "produto" && editando.id === produto.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`ativo-${produto.id}`}
                                name="ativo"
                                checked={editando.dados.ativo}
                                onChange={handleInputChange}
                              />
                              <label htmlFor={`ativo-${produto.id}`}>Ativo</label>
                            </div>
                          ) : produto.ativo ? (
                            "Ativo"
                          ) : (
                            "Inativo"
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "produto" && editando.id === produto.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={salvarEdicao}>
                                <Save className="h-4 w-4 mr-1" /> Salvar
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelarEdicao}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("produto", produto.id, produto)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("produto", produto.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo da aba Categorias */}
          <TabsContent value="categorias" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gerenciar Categorias</h2>
              <Button onClick={() => adicionarItem("categoria")}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Categoria
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
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
                        <TableCell>
                          {editando.tipo === "categoria" && editando.id === categoria.id ? (
                            <Input name="nome" value={editando.dados.nome || ""} onChange={handleInputChange} />
                          ) : (
                            categoria.nome
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "categoria" && editando.id === categoria.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`ativo-${categoria.id}`}
                                name="ativo"
                                checked={editando.dados.ativo}
                                onChange={handleInputChange}
                              />
                              <label htmlFor={`ativo-${categoria.id}`}>Ativo</label>
                            </div>
                          ) : categoria.ativo ? (
                            "Ativo"
                          ) : (
                            "Inativo"
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "categoria" && editando.id === categoria.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={salvarEdicao}>
                                <Save className="h-4 w-4 mr-1" /> Salvar
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelarEdicao}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("categoria", categoria.id, categoria)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("categoria", categoria.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <Button onClick={() => adicionarItem("bairro")}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Bairro
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
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
                        <TableCell>
                          {editando.tipo === "bairro" && editando.id === bairro.id ? (
                            <Input name="nome" value={editando.dados.nome || ""} onChange={handleInputChange} />
                          ) : (
                            bairro.nome
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "bairro" && editando.id === bairro.id ? (
                            <Input
                              name="taxa"
                              type="number"
                              step="0.01"
                              value={editando.dados.taxa || 0}
                              onChange={handleInputChange}
                            />
                          ) : (
                            formatarPreco(bairro.taxa)
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "bairro" && editando.id === bairro.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`ativo-${bairro.id}`}
                                name="ativo"
                                checked={editando.dados.ativo}
                                onChange={handleInputChange}
                              />
                              <label htmlFor={`ativo-${bairro.id}`}>Ativo</label>
                            </div>
                          ) : bairro.ativo ? (
                            "Ativo"
                          ) : (
                            "Inativo"
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "bairro" && editando.id === bairro.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={salvarEdicao}>
                                <Save className="h-4 w-4 mr-1" /> Salvar
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelarEdicao}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("bairro", bairro.id, bairro)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removerItem("bairro", bairro.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-8">
              <h2 className="text-xl font-bold">Métodos de Pagamento</h2>
              <Button onClick={() => adicionarItem("metodoPagamento")}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Método
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
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
                        <TableCell>
                          {editando.tipo === "metodoPagamento" && editando.id === metodo.id ? (
                            <Input name="nome" value={editando.dados.nome || ""} onChange={handleInputChange} />
                          ) : (
                            metodo.nome
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "metodoPagamento" && editando.id === metodo.id ? (
                            <Input name="valor" value={editando.dados.valor || ""} onChange={handleInputChange} />
                          ) : (
                            metodo.valor
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "metodoPagamento" && editando.id === metodo.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`ativo-${metodo.id}`}
                                name="ativo"
                                checked={editando.dados.ativo}
                                onChange={handleInputChange}
                              />
                              <label htmlFor={`ativo-${metodo.id}`}>Ativo</label>
                            </div>
                          ) : metodo.ativo ? (
                            "Ativo"
                          ) : (
                            "Inativo"
                          )}
                        </TableCell>
                        <TableCell>
                          {editando.tipo === "metodoPagamento" && editando.id === metodo.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={salvarEdicao}>
                                <Save className="h-4 w-4 mr-1" /> Salvar
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelarEdicao}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => iniciarEdicao("metodoPagamento", metodo.id, metodo)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerItem("metodoPagamento", metodo.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                      <div className="space-y-2">
                        <Label htmlFor="nomeEstabelecimento">Nome do Estabelecimento</Label>
                        <Input
                          id="nomeEstabelecimento"
                          name="nomeEstabelecimento"
                          value={editando.dados.nomeEstabelecimento || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefoneWhatsapp">Telefone WhatsApp</Label>
                        <Input
                          id="telefoneWhatsapp"
                          name="telefoneWhatsapp"
                          value={editando.dados.telefoneWhatsapp || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input
                          id="endereco"
                          name="endereco"
                          value={editando.dados.endereco || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="horarioFuncionamento">Horário de Funcionamento</Label>
                        <Input
                          id="horarioFuncionamento"
                          name="horarioFuncionamento"
                          value={editando.dados.horarioFuncionamento || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">URL do Logo</Label>
                        <Input
                          id="logoUrl"
                          name="logoUrl"
                          value={editando.dados.logoUrl || ""}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button onClick={salvarEdicao}>
                          <Save className="h-4 w-4 mr-1" /> Salvar Configurações
                        </Button>
                        <Button variant="outline" onClick={cancelarEdicao}>
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Nome do Estabelecimento</h3>
                          <p>{configuracoes.nomeEstabelecimento}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Telefone WhatsApp</h3>
                          <p>{configuracoes.telefoneWhatsapp}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Endereço</h3>
                          <p>{configuracoes.endereco}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Horário de Funcionamento</h3>
                          <p>{configuracoes.horarioFuncionamento}</p>
                        </div>

                        <div className="md:col-span-2">
                          <h3 className="font-semibold mb-2">Logo</h3>
                          <div className="border p-4 rounded-md inline-block">
                            <img src={configuracoes.logoUrl || "/placeholder.svg"} alt="Logo" className="h-16" />
                          </div>
                        </div>
                      </div>

                      <Button className="mt-6" onClick={() => iniciarEdicao("configuracoes", null, configuracoes)}>
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
