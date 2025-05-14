"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs"
import { ShoppingCart, Plus, Minus, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCarrinho } from "@/hooks/use-carrinho"
import { useTema } from "@/hooks/use-tema"
import { formatarPreco } from "@/lib/utils"
import { CarrinhoFlutuante } from "@/components/carrinho-flutuante"
import type { Categoria } from "@/services/categorias"
import type { Produto } from "@/services/produtos"
import type { Bairro } from "@/services/bairros"
import type { MetodoPagamento } from "@/services/metodos-pagamento"
import type { Banner } from "@/services/banners"
import type { Configuracao } from "@/services/configuracoes"

interface ClientePageProps {
  categorias: Categoria[]
  produtos: Produto[]
  bairros: Bairro[]
  metodosPagamento: MetodoPagamento[]
  banners: Banner[]
  configuracoes: Configuracao
}

export default function ClientePage({
  categorias,
  produtos: produtosIniciais,
  bairros,
  metodosPagamento,
  banners,
  configuracoes,
}: ClientePageProps) {
  const { toast } = useToast()
  const { carrinho, adicionarItem, removerItem, limparCarrinho, total } = useCarrinho()
  const { tema, atualizarTema } = useTema()
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("")
  const [dadosCliente, setDadosCliente] = useState({
    nome: "",
    entrega: false,
    rua: "",
    numero: "",
    bairro: "",
    telefone: "",
    observacoes: "",
    metodoPagamento: metodosPagamento.length > 0 ? metodosPagamento[0].valor : "dinheiro",
  })
  const [taxaEntrega, setTaxaEntrega] = useState(0)
  const [carregando, setCarregando] = useState(false)

  // Aplicar configurações de tema - CORRIGIDO para evitar loop infinito
  useEffect(() => {
    if (configuracoes) {
      const novoTema = {
        corPrimaria: configuracoes.cor_primaria,
        corSecundaria: configuracoes.cor_secundaria,
        corAcento: configuracoes.cor_acento,
        corFundo: configuracoes.cor_fundo,
        corTexto: configuracoes.cor_texto,
        borderRadius: configuracoes.border_radius,
      }

      // Verificar se o tema realmente mudou antes de atualizar
      if (
        tema.corPrimaria !== novoTema.corPrimaria ||
        tema.corSecundaria !== novoTema.corSecundaria ||
        tema.corAcento !== novoTema.corAcento ||
        tema.corFundo !== novoTema.corFundo ||
        tema.corTexto !== novoTema.corTexto ||
        tema.borderRadius !== novoTema.borderRadius
      ) {
        atualizarTema(novoTema)
      }
    }
  }, [configuracoes]) // Removido tema e atualizarTema das dependências

  // Definir categoria inicial
  useEffect(() => {
    if (categorias.length > 0 && !categoriaSelecionada) {
      setCategoriaSelecionada(categorias[0].id.toString())
    }
  }, [categorias, categoriaSelecionada])

  // Carregar produtos quando a categoria mudar
  useEffect(() => {
    if (categoriaSelecionada) {
      const carregarProdutos = async () => {
        setCarregando(true)
        try {
          const response = await fetch(`/api/produtos?categoria=${categoriaSelecionada}`)
          if (response.ok) {
            const data = await response.json()
            setProdutos(data)
          }
        } catch (error) {
          console.error("Erro ao carregar produtos:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os produtos.",
            variant: "destructive",
          })
        } finally {
          setCarregando(false)
        }
      }

      carregarProdutos()
    }
  }, [categoriaSelecionada, toast])

  const handleChangeBairro = (e) => {
    const bairroId = Number.parseInt(e.target.value)
    const bairroSelecionado = bairros.find((b) => b.id === bairroId)

    if (bairroSelecionado) {
      setTaxaEntrega(bairroSelecionado.taxa)
      setDadosCliente({
        ...dadosCliente,
        bairro: bairroSelecionado.nome,
      })
    } else {
      setTaxaEntrega(0)
    }
  }

  const handleChangeEntrega = (checked) => {
    setDadosCliente({
      ...dadosCliente,
      entrega: checked,
    })

    if (!checked) {
      setTaxaEntrega(0)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDadosCliente({
      ...dadosCliente,
      [name]: value,
    })
  }

  // Modificar a função enviarPedido para incluir o redirecionamento para o WhatsApp
  const enviarPedido = async () => {
    if (!dadosCliente.nome) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu nome.",
        variant: "destructive",
      })
      return
    }

    if (dadosCliente.entrega && (!dadosCliente.rua || !dadosCliente.numero || !dadosCliente.bairro)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os dados de entrega.",
        variant: "destructive",
      })
      return
    }

    if (!dadosCliente.telefone) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu telefone para contato.",
        variant: "destructive",
      })
      return
    }

    if (carrinho.length === 0) {
      toast({
        title: "Erro",
        description: "Seu carrinho está vazio.",
        variant: "destructive",
      })
      return
    }

    setCarregando(true)

    try {
      const pedido = {
        cliente: {
          nome: dadosCliente.nome,
          telefone: dadosCliente.telefone,
        },
        pedido: {
          total: total,
          taxa_entrega: taxaEntrega,
          metodo_pagamento: dadosCliente.metodoPagamento,
          status: "Pendente",
          entrega: dadosCliente.entrega,
          rua: dadosCliente.rua,
          numero: dadosCliente.numero,
          bairro: dadosCliente.bairro,
          observacoes: dadosCliente.observacoes,
        },
        itens: carrinho.map((item) => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
        })),
      }

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedido),
      })

      if (response.ok) {
        const resultado = await response.json()

        toast({
          title: "Sucesso!",
          description: "Seu pedido foi enviado com sucesso!",
        })

        // Redirecionar para o WhatsApp se houver um link e a configuração estiver ativada
        if (resultado.whatsapp && resultado.whatsapp.link && configuracoes.envio_automatico_whatsapp) {
          // Abrir o link do WhatsApp em uma nova aba
          window.open(resultado.whatsapp.link, "_blank")
        }

        limparCarrinho()
        setDadosCliente({
          nome: "",
          entrega: false,
          rua: "",
          numero: "",
          bairro: "",
          telefone: "",
          observacoes: "",
          metodoPagamento: metodosPagamento.length > 0 ? metodosPagamento[0].valor : "dinheiro",
        })
      } else {
        const erro = await response.json()
        throw new Error(erro.message || "Erro ao enviar pedido")
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar seu pedido. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter((p) => p.categoria_id === Number.parseInt(categoriaSelecionada))
    : produtos

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Resto do código permanece igual */}
      {/* ... */}

      {/* Cabeçalho */}
      <header className="bg-white shadow-sm" style={{ backgroundColor: tema.corFundo }}>
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="text-center">
            <Image
              src={configuracoes.logo_url || "/placeholder.svg?height=60&width=200"}
              alt={`Logo ${configuracoes.nome_estabelecimento}`}
              width={200}
              height={60}
              className="mx-auto"
            />
            <h1 className="text-2xl font-bold mt-2" style={{ color: tema.corTexto }}>
              {configuracoes.nome_estabelecimento}
            </h1>
          </div>
        </div>
      </header>

      {/* Menu de Categorias */}
      <div className="bg-gray-100 sticky top-0 z-10" style={{ backgroundColor: tema.corSecundaria, color: "white" }}>
        <div className="container mx-auto p-2">
          <Tabs value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent">
              {categorias.map((categoria) => (
                <TabsTrigger
                  key={categoria.id}
                  value={categoria.id.toString()}
                  className="px-4 py-2 whitespace-nowrap data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  {categoria.nome}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="container mx-auto p-4">
        {/* Banner Rotativo */}
        {banners.length > 0 && (
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-[200px] w-full">
                      <Image
                        src={banner.imagem_url || "/placeholder.svg"}
                        alt={banner.titulo}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                        <h3 className="text-lg font-semibold">{banner.titulo}</h3>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4" style={{ color: tema.corTexto }}>
              Cardápio
            </h2>
            {carregando ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhum produto encontrado nesta categoria.</p>
            ) : (
              <div className="space-y-4">
                {produtosFiltrados.map((produto) => (
                  <Card key={produto.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          <Image
                            src={produto.imagem_url || "/placeholder.svg"}
                            alt={produto.nome}
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold">{produto.nome}</h3>
                          <p className="text-sm text-gray-600">{produto.descricao}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-green-600">{formatarPreco(produto.preco)}</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                adicionarItem(produto)
                                toast({
                                  description: `${produto.nome} adicionado ao carrinho`,
                                })
                              }}
                              style={{ backgroundColor: tema.corPrimaria }}
                              className="hover:bg-orange-600"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Carrinho e Formulário de Pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-16">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-4 flex items-center" style={{ color: tema.corTexto }}>
                    <ShoppingCart className="mr-2" /> Seu Pedido
                  </h2>

                  {carrinho.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Seu carrinho está vazio</p>
                  ) : (
                    <div className="space-y-4 mb-4">
                      {carrinho.map((item) => (
                        <div
                          key={`${item.id}-${item.timestamp}`}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-sm text-gray-600">{formatarPreco(item.preco)}</p>
                          </div>
                          <div className="flex items-center">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removerItem(item)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="mx-2">{item.quantidade}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => adicionarItem(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between font-bold">
                        <span>Subtotal:</span>
                        <span>{formatarPreco(total)}</span>
                      </div>

                      {dadosCliente.entrega && (
                        <div className="flex justify-between text-sm">
                          <span>Taxa de entrega:</span>
                          <span>{formatarPreco(taxaEntrega)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatarPreco(total + taxaEntrega)}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mt-6">
                    <h3 className="font-bold" style={{ color: tema.corTexto }}>
                      Seus dados
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="Seu nome completo"
                        value={dadosCliente.nome}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={dadosCliente.telefone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="entrega" checked={dadosCliente.entrega} onCheckedChange={handleChangeEntrega} />
                      <Label htmlFor="entrega">Quero receber em casa</Label>
                    </div>

                    {dadosCliente.entrega && (
                      <div className="space-y-4 border-l-2 pl-4 mt-2" style={{ borderColor: tema.corPrimaria }}>
                        <div className="space-y-2">
                          <Label htmlFor="rua">Rua</Label>
                          <Input
                            id="rua"
                            name="rua"
                            placeholder="Nome da rua"
                            value={dadosCliente.rua}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="numero">Número</Label>
                          <Input
                            id="numero"
                            name="numero"
                            placeholder="Número"
                            value={dadosCliente.numero}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bairro">Bairro</Label>
                          <select id="bairro" className="w-full p-2 border rounded-md" onChange={handleChangeBairro}>
                            <option value="">Selecione o bairro</option>
                            {bairros.map((bairro) => (
                              <option key={bairro.id} value={bairro.id}>
                                {bairro.nome} - Taxa: {formatarPreco(bairro.taxa)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="metodoPagamento">Forma de Pagamento</Label>
                      <select
                        id="metodoPagamento"
                        name="metodoPagamento"
                        className="w-full p-2 border rounded-md"
                        value={dadosCliente.metodoPagamento}
                        onChange={handleInputChange}
                      >
                        {metodosPagamento.map((metodo) => (
                          <option key={metodo.id} value={metodo.valor}>
                            {metodo.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <textarea
                        id="observacoes"
                        name="observacoes"
                        placeholder="Alguma observação sobre seu pedido?"
                        className="w-full p-2 border rounded-md min-h-[80px]"
                        value={dadosCliente.observacoes}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Button
                      className="w-full hover:bg-orange-600"
                      size="lg"
                      onClick={enviarPedido}
                      disabled={carrinho.length === 0 || carregando}
                      style={{ backgroundColor: tema.corPrimaria }}
                    >
                      {carregando ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Processando...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Finalizar Pedido
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-12 py-6" style={{ backgroundColor: tema.corAcento }}>
        <div className="container mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} {configuracoes.nome_estabelecimento}. Todos os direitos reservados.
          </p>
          <p className="text-sm mt-2">{configuracoes.endereco}</p>
          <p className="text-sm">Telefone: {configuracoes.telefone_whatsapp}</p>
          <p className="text-sm mt-2">{configuracoes.horario_funcionamento}</p>
        </div>
      </footer>

      {/* Carrinho Flutuante */}
      <CarrinhoFlutuante />
    </div>
  )
}
