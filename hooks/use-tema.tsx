"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type TemaConfig = {
  corPrimaria: string
  corSecundaria: string
  corAcento: string
  corFundo: string
  corTexto: string
  borderRadius: string
  modoEscuro: boolean
}

type TemaContextType = {
  tema: TemaConfig
  atualizarTema: (novoTema: Partial<TemaConfig>) => void
  toggleModoEscuro: () => void
}

const temaInicial: TemaConfig = {
  corPrimaria: "#f97316", // orange-500
  corSecundaria: "#fb923c", // orange-400
  corAcento: "#ea580c", // orange-600
  corFundo: "#ffffff", // white
  corTexto: "#1f2937", // gray-800
  borderRadius: "0.5rem",
  modoEscuro: false,
}

// Cores para o modo escuro
const coresModoEscuro = {
  corFundo: "#121212", // Fundo escuro
  corTexto: "#e5e5e5", // Texto claro
}

const TemaContext = createContext<TemaContextType | undefined>(undefined)

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<TemaConfig>(temaInicial)
  const [isInitialized, setIsInitialized] = useState(false)

  // Carregar tema do localStorage apenas uma vez na inicialização
  useEffect(() => {
    // Tentar carregar o tema do localStorage
    const temaArmazenado = localStorage.getItem("tema-config")
    if (temaArmazenado) {
      try {
        const temaParsed = JSON.parse(temaArmazenado)
        setTema(temaParsed)
      } catch (error) {
        console.error("Erro ao carregar tema:", error)
      }
    }
    setIsInitialized(true)
  }, [])

  // Aplicar variáveis CSS quando o tema mudar
  useEffect(() => {
    if (!isInitialized) return

    // Aplicar as variáveis CSS
    document.documentElement.style.setProperty("--tema-primary", tema.corPrimaria)
    document.documentElement.style.setProperty("--tema-secondary", tema.corSecundaria)
    document.documentElement.style.setProperty("--tema-accent", tema.corAcento)
    document.documentElement.style.setProperty("--tema-background", tema.corFundo)
    document.documentElement.style.setProperty("--tema-text", tema.corTexto)
    document.documentElement.style.setProperty("--radius", tema.borderRadius)

    // Também atualizar as variáveis do shadcn/ui
    document.documentElement.style.setProperty("--primary", toHSL(tema.corPrimaria))
    document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%")

    // Aplicar classe de modo escuro ao documento
    if (tema.modoEscuro) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Salvar no localStorage
    localStorage.setItem("tema-config", JSON.stringify(tema))
  }, [tema, isInitialized])

  // Alternar entre modo claro e escuro
  const toggleModoEscuro = useCallback(() => {
    setTema((temaAtual) => {
      const novoModoEscuro = !temaAtual.modoEscuro

      // Ajustar cores com base no modo
      const novaCorFundo = novoModoEscuro ? coresModoEscuro.corFundo : temaInicial.corFundo
      const novaCorTexto = novoModoEscuro ? coresModoEscuro.corTexto : temaInicial.corTexto

      return {
        ...temaAtual,
        modoEscuro: novoModoEscuro,
        corFundo: novaCorFundo,
        corTexto: novaCorTexto,
      }
    })
  }, [])

  // Usar useCallback para evitar recriação da função em cada renderização
  const atualizarTema = useCallback((novoTema: Partial<TemaConfig>) => {
    setTema((temaAtual) => {
      // Verificar se há mudanças reais antes de atualizar
      const temaAtualizado = { ...temaAtual, ...novoTema }

      // Verificar se algum valor realmente mudou
      if (
        temaAtual.corPrimaria === temaAtualizado.corPrimaria &&
        temaAtual.corSecundaria === temaAtualizado.corSecundaria &&
        temaAtual.corAcento === temaAtualizado.corAcento &&
        temaAtual.corFundo === temaAtualizado.corFundo &&
        temaAtual.corTexto === temaAtualizado.corTexto &&
        temaAtual.borderRadius === temaAtualizado.borderRadius &&
        temaAtual.modoEscuro === temaAtualizado.modoEscuro
      ) {
        // Se nada mudou, retornar o estado atual para evitar re-renderização
        return temaAtual
      }

      return temaAtualizado
    })
  }, [])

  return <TemaContext.Provider value={{ tema, atualizarTema, toggleModoEscuro }}>{children}</TemaContext.Provider>
}

export function useTema() {
  const context = useContext(TemaContext)
  if (context === undefined) {
    throw new Error("useTema deve ser usado dentro de um TemaProvider")
  }
  return context
}

// Função auxiliar para converter hex para HSL (simplificada)
function toHSL(hex: string): string {
  // Esta é uma implementação simplificada
  // Em um caso real, você precisaria de uma conversão mais robusta
  return "24 95% 53%" // Valor HSL aproximado para laranja
}
