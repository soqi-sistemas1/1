"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, PlusCircle, Trash, Edit, Save, X, Shield, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import type { Administrador } from "@/services/administradores"

export default function AdministradoresPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState<{
    id: number | null
    dados: Partial<Administrador> & { novaSenha?: string }
  }>({
    id: null,
    dados: {},
  })
  const [adminAtual, setAdminAtual] = useState<Administrador | null>(null)

  useEffect(() => {
    const carregarAdministradores = async () => {
      try {
        const response = await fetch("/api/admin/administradores")
        if (response.ok) {
          const data = await response.json()
          setAdministradores(data)

          // Identificar o administrador atual
          if (user) {
            const adminLogado = data.find((admin) => admin.email === user.email)
            if (adminLogado) {
              setAdminAtual(adminLogado)
            }
          }
        } else {
          throw new Error("Erro ao carregar administradores")
        }
      } catch (error) {
        console.error("Erro:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os administradores.",
          variant: "destructive",
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarAdministradores()
  }, [toast, user])

  const iniciarEdicao = (admin: Administrador) => {
    setEditando({
      id: admin.id,
      dados: {
        nome: admin.nome,
        email: admin.email,
        cargo: admin.cargo,
        ativo: admin.ativo,
        super_admin: admin.super_admin,
        novaSenha: "",
      },
    })
  }

  const iniciarNovo = () => {
    setEditando({
      id: null,
      dados: {
        nome: "",
        email: "",
        cargo: "Administrador",
        ativo: true,
        super_admin: false,
        novaSenha: "",
      },
    })
  }

  const cancelarEdicao = () => {
    setEditando({ id: null, dados: {} })
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

  const handleSwitchChange = (name: string, checked: boolean) => {
    setEditando({
      ...editando,
      dados: {
        ...editando.dados,
        [name]: checked,
      },
    })
  }

  const salvarAdministrador = async () => {
    if (!editando.dados.nome || !editando.dados.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (!editando.id && !editando.dados.novaSenha) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória para novos administradores.",
        variant: "destructive",
      })
      return
    }

    setCarregando(true)

    try {
      let response

      if (editando.id) {
        // Atualizar administrador existente
        response = await fetch(`/api/admin/administradores/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: editando.dados.nome,
            email: editando.dados.email,
            cargo: editando.dados.cargo,
            ativo: editando.dados.ativo,
            superAdmin: editando.dados.super_admin,
            novaSenha: editando.dados.novaSenha || undefined,
          }),
        })
      } else {
        // Criar novo administrador
        response = await fetch("/api/admin/administradores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: editando.dados.nome,
            email: editando.dados.email,
            senha: editando.dados.novaSenha,
            cargo: editando.dados.cargo,
            superAdmin: editando.dados.super_admin,
          }),
        })
      }

      if (!response.ok) {
        const erro = await response.json()
        throw new Error(erro.error || "Erro ao salvar administrador")
      }

      const adminSalvo = await response.json()

      // Atualizar a lista de administradores
      if (editando.id) {
        setAdministradores(administradores.map((a) => (a.id === editando.id ? adminSalvo : a)))
      } else {
        setAdministradores([...administradores, adminSalvo])
      }

      toast({
        description: `Administrador ${editando.id ? "atualizado" : "criado"} com sucesso!`,
      })

      cancelarEdicao()
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o administrador.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  const excluirAdmin = async (id: number) => {
    // Verificar se é o próprio usuário
    const adminParaExcluir = administradores.find((a) => a.id === id)
    if (adminParaExcluir?.email === user?.email) {
      toast({
        title: "Operação não permitida",
        description: "Você não pode excluir sua própria conta.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Tem certeza que deseja excluir este administrador?")) {
      return
    }

    setCarregando(true)

    try {
      const response = await fetch(`/api/admin/administradores/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const erro = await response.json()
        throw new Error(erro.error || "Erro ao excluir administrador")
      }

      // Remover da lista
      setAdministradores(administradores.filter((a) => a.id !== id))

      toast({
        description: "Administrador excluído com sucesso!",
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao excluir o administrador.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  // Verificar se o usuário atual é super admin
  const isSuperAdmin = adminAtual?.super_admin || false

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              <ArrowLeft className="h-6 w-6 dark:text-gray-300" />
            </Link>
            <h1 className="text-xl font-bold dark:text-white">Gerenciar Administradores</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!isSuperAdmin && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 dark:bg-yellow-900 dark:text-yellow-200">
            <p className="font-bold">Acesso limitado</p>
            <p>Você não tem permissões de super administrador. Algumas ações podem estar restritas.</p>
          </div>
        )}

        {editando.id !== null || editando.dados.nome ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editando.id ? "Editar Administrador" : "Novo Administrador"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={editando.dados.nome || ""}
                    onChange={handleInputChange}
                    disabled={carregando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editando.dados.email || ""}
                    onChange={handleInputChange}
                    disabled={carregando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    value={editando.dados.cargo || ""}
                    onChange={handleInputChange}
                    disabled={carregando}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="novaSenha">{editando.id ? "Nova Senha (opcional)" : "Senha"}</Label>
                  <Input
                    id="novaSenha"
                    name="novaSenha"
                    type="password"
                    value={editando.dados.novaSenha || ""}
                    onChange={handleInputChange}
                    disabled={carregando}
                    placeholder={editando.id ? "Deixe em branco para manter a atual" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ativo">Ativo</Label>
                    <Switch
                      id="ativo"
                      checked={editando.dados.ativo}
                      onCheckedChange={(checked) => handleSwitchChange("ativo", checked)}
                      disabled={carregando}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Administradores inativos não podem fazer login
                  </p>
                </div>

                {isSuperAdmin && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="super_admin">Super Administrador</Label>
                      <Switch
                        id="super_admin"
                        checked={editando.dados.super_admin}
                        onCheckedChange={(checked) => handleSwitchChange("super_admin", checked)}
                        disabled={carregando}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Super administradores podem gerenciar outros administradores
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={salvarAdministrador} disabled={carregando}>
                  {carregando ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Salvar
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={cancelarEdicao} disabled={carregando}>
                  <X className="h-4 w-4 mr-2" /> Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-end mb-4">
            {isSuperAdmin && (
              <Button onClick={iniciarNovo} disabled={carregando}>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Administrador
              </Button>
            )}
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            {carregando && !editando.id && !editando.dados.nome ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {administradores.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.nome}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.cargo}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            admin.ativo
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {admin.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {admin.super_admin ? (
                          <div className="flex items-center">
                            <ShieldAlert className="h-4 w-4 mr-1 text-orange-500" />
                            <span>Super Admin</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-blue-500" />
                            <span>Admin</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => iniciarEdicao(admin)}
                            disabled={carregando || (!isSuperAdmin && admin.id !== adminAtual?.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && admin.id !== adminAtual?.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => excluirAdmin(admin.id)}
                              disabled={carregando}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
