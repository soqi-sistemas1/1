"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

type Produto = {
  id: number
  nome: string
  descricao: string
  preco: number
  imagem: string
  categoriaId: number
}

type ItemCarrinho = Produto & {
  quantidade: number
  timestamp: number
}

type CarrinhoContextType = {
  carrinho: ItemCarrinho[]
  adicionarItem: (produto: Produto) => void
  removerItem: (produto: ItemCarrinho) => void
  limparCarrinho: () => void
  total: number
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined)

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // Calcular o total sempre que o carrinho mudar
    const novoTotal = carrinho.reduce((acc, item) => {
      return acc + item.preco * item.quantidade
    }, 0)

    setTotal(novoTotal)
  }, [carrinho])

  const adicionarItem = (produto: Produto) => {
    setCarrinho((carrinhoAtual) => {
      // Verificar se o produto já está no carrinho
      const itemExistente = carrinhoAtual.find((item) => item.id === produto.id)

      if (itemExistente) {
        // Se já existe, aumentar a quantidade
        return carrinhoAtual.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        )
      } else {
        // Se não existe, adicionar ao carrinho
        return [
          ...carrinhoAtual,
          {
            ...produto,
            quantidade: 1,
            timestamp: Date.now(), // Adicionar timestamp para garantir chave única
          },
        ]
      }
    })
  }

  const removerItem = (produto: ItemCarrinho) => {
    setCarrinho((carrinhoAtual) => {
      // Encontrar o item no carrinho
      const itemExistente = carrinhoAtual.find((item) => item.id === produto.id && item.timestamp === produto.timestamp)

      if (itemExistente && itemExistente.quantidade > 1) {
        // Se a quantidade for maior que 1, diminuir a quantidade
        return carrinhoAtual.map((item) =>
          item.id === produto.id && item.timestamp === produto.timestamp
            ? { ...item, quantidade: item.quantidade - 1 }
            : item,
        )
      } else {
        // Se a quantidade for 1, remover o item do carrinho
        return carrinhoAtual.filter((item) => !(item.id === produto.id && item.timestamp === produto.timestamp))
      }
    })
  }

  const limparCarrinho = () => {
    setCarrinho([])
  }

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarItem,
        removerItem,
        limparCarrinho,
        total,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext)

  if (context === undefined) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider")
  }

  return context
}
