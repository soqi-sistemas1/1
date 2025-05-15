"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { ShoppingBag, Lock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error("Erro de login:", signInError)
        setError("Credenciais inválidas. Tente novamente.")
        setLoading(false)
      } else {
        toast({
          title: "Login bem-sucedido",
          description: "Redirecionando para o painel administrativo...",
        })

        // Usar setTimeout para dar tempo ao toast aparecer antes do redirecionamento
        setTimeout(() => {
          router.push("/admin")
          router.refresh() // Forçar atualização da página
        }, 1000)
      }
    } catch (err) {
      console.error("Erro de login:", err)
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500 text-white p-3 rounded-full">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Painel Administrativo</CardTitle>
            <CardDescription className="text-center">Entre com suas credenciais para acessar o painel</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                    Entrando...
                  </div>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Entrar
                  </>
                )}
              </Button>
              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-orange-500">
                  Voltar para o site
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
