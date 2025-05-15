"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  userPreferences: {
    modoEscuro: boolean
  }
  updateUserPreferences: (preferences: { modoEscuro?: boolean }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userPreferences, setUserPreferences] = useState({ modoEscuro: false })
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  // Função para atualizar preferências do usuário
  const updateUserPreferences = async (preferences: { modoEscuro?: boolean }) => {
    if (!user) return

    try {
      // Atualizar no estado local
      setUserPreferences((prev) => ({ ...prev, ...preferences }))

      // Atualizar no banco de dados
      const { error } = await supabase.from("preferencias_usuario").upsert({
        user_id: user.id,
        modo_escuro: preferences.modoEscuro !== undefined ? preferences.modoEscuro : userPreferences.modoEscuro,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Erro ao atualizar preferências:", error)
      }

      // Aplicar modo escuro ao documento
      if (preferences.modoEscuro !== undefined) {
        if (preferences.modoEscuro) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error)
    }
  }

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkUser = async () => {
      setLoading(true)

      try {
        console.log("Verificando sessão do usuário...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          console.log("Sessão encontrada para:", session.user.email)

          // Buscar informações adicionais do administrador
          const { data: adminData, error: adminError } = await supabase
            .from("administradores")
            .select("*")
            .eq("user_id", session.user.id)
            .single()

          if (adminError && adminError.code !== "PGRST116") {
            console.error("Erro ao buscar dados do administrador:", adminError)
          }

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            isAdmin: !!adminData,
            isSuperAdmin: adminData?.super_admin || false,
          })

          // Carregar preferência de modo escuro
          if (adminData) {
            const { data: prefData } = await supabase
              .from("preferencias_usuario")
              .select("modo_escuro")
              .eq("user_id", session.user.id)
              .single()

            if (prefData) {
              setUserPreferences({ modoEscuro: prefData.modo_escuro })

              // Aplicar modo escuro diretamente
              if (prefData.modo_escuro) {
                document.documentElement.classList.add("dark")
              } else {
                document.documentElement.classList.remove("dark")
              }
            }
          }
        } else {
          console.log("Nenhuma sessão encontrada")
          setUser(null)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (session?.user) {
        try {
          // Buscar informações adicionais do administrador
          const { data: adminData, error: adminError } = await supabase
            .from("administradores")
            .select("*")
            .eq("user_id", session.user.id)
            .single()

          if (adminError && adminError.code !== "PGRST116") {
            console.error("Erro ao buscar dados do administrador:", adminError)
          }

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            isAdmin: !!adminData,
            isSuperAdmin: adminData?.super_admin || false,
          })

          // Carregar preferência de modo escuro
          if (adminData) {
            const { data: prefData } = await supabase
              .from("preferencias_usuario")
              .select("modo_escuro")
              .eq("user_id", session.user.id)
              .single()

            if (prefData) {
              setUserPreferences({ modoEscuro: prefData.modo_escuro })

              // Aplicar modo escuro diretamente
              if (prefData.modo_escuro) {
                document.documentElement.classList.add("dark")
              } else {
                document.documentElement.classList.remove("dark")
              }
            }
          }
        } catch (error) {
          console.error("Erro ao processar autenticação:", error)
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando fazer login com:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de autenticação:", error)
        return { error }
      }

      console.log("Login bem-sucedido:", data.user?.email)

      // Buscar informações adicionais do administrador imediatamente após o login
      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from("administradores")
          .select("*")
          .eq("user_id", data.user.id)
          .single()

        if (adminError && adminError.code !== "PGRST116") {
          console.error("Erro ao buscar dados do administrador após login:", adminError)
        }

        setUser({
          id: data.user.id,
          email: data.user.email || "",
          isAdmin: !!adminData,
          isSuperAdmin: adminData?.super_admin || false,
        })
      }

      return { error: null }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/admin/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        userPreferences,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }

  return context
}
