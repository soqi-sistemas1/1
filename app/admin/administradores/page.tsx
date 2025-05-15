"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Trash2, PencilIcon, UserPlus } from "lucide-react"

type Administrador = {
  id: number
  user_id: string
  nome: string
  email: string
  cargo: string
  ativo: boolean
  super_admin: boolean
}

export default function AdministradoresPage() {
  const { user } = useAuth()
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [currentAdmin, setCurrentAdmin] = useState<Administrador | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
    senha: "",
    confirmarSenha: "",
    ativo: true,
    super_admin: false,
  })

  useEffect(() => {
    if (!user?.isSuperAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      })
      return
    }

    fetchAdministradores()
  }, [user])

  const fetchAdministradores = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/administradores")
      const data = await response.json()

      if (data.success) {
        setAdministradores(data.administradores)
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao carregar administradores",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar administradores:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os administradores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      cargo: "",
      senha: "",
      confirmarSenha: "",
      ativo: true,
      super_admin: false,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setDialogMode("add")
    setOpenDialog(true)
  }

  const openEditDialog = (admin: Administrador) => {
    setCurrentAdmin(admin)
    setFormData({
      nome: admin.nome,
      email: admin.email,
      cargo: admin.cargo || "",
      senha: "",
      confirmarSenha: "",
      ativo: admin.ativo,
      super_admin: admin.super_admin,
    })
    setDialogMode("edit")
    setOpenDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.nome || !formData.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (dialogMode === "add" && formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    try {
      let response

      if (dialogMode === "add") {
        // Adicionar novo administrador
        response = await fetch("/api/admin/administradores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            cargo: formData.cargo,
            senha: formData.senha,
            ativo: formData.ativo,
            super_admin: formData.super_admin,
          }),
        })
      } else if (dialogMode === "edit" && currentAdmin) {
        // Editar administrador existente
        const updateData: any = {
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          ativo: formData.ativo,
          super_admin: formData.super_admin,
        }

        // Incluir senha apenas se foi fornecida
        if (formData.senha) {
          if (formData.senha !== formData.confirmarSenha) {
            toast({
              title: "Erro",
              description: "As senhas não coincidem",
              variant: "destructive",
            })
            return
          }
          updateData.senha = formData.senha
        }

        response = await fetch(`/api/admin/administradores/${currentAdmin.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        })
      }

      if (response) {
        const data = await response.json()

        if (data.success) {
          toast({
            title: "Sucesso",
            description:
              dialogMode === "add" ? "Administrador adicionado com sucesso" : "Administrador atualizado com sucesso",
          })
          setOpenDialog(false)
          fetchAdministradores()
        } else {
          toast({
            title: "Erro",
            description: data.message || "Erro ao processar a solicitação",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao processar administrador:", error)
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (admin: Administrador) => {
    // Impedir que o usuário exclua a si mesmo
    if (admin.user_id === user?.id) {
      toast({
        title: "Operação não permitida",
        description: "Você não pode excluir sua própria conta",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Tem certeza que deseja excluir o administrador ${admin.nome}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/administradores/${admin.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Administrador excluído com sucesso",
        })
        fetchAdministradores()
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao excluir administrador",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao excluir administrador:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o administrador",
        variant: "destructive",
      })
    }
  }

  if (!user?.isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Administradores</h1>
        <Button onClick={openAddDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Administrador
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Super Admin</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {administradores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center">
                    Nenhum administrador encontrado
                  </td>
                </tr>
              ) : (
                administradores.map((admin) => (
                  <tr key={admin.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3">{admin.nome}</td>
                    <td className="px-4 py-3">{admin.email}</td>
                    <td className="px-4 py-3">{admin.cargo || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          admin.ativo
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {admin.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {admin.super_admin ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          Sim
                        </span>
                      ) : (
                        "Não"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(admin)} className="h-8 px-2">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(admin)}
                          className="h-8 px-2 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                          disabled={admin.user_id === user?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Adicionar Administrador" : "Editar Administrador"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" value={formData.cargo} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">
                    {dialogMode === "add" ? "Senha" : "Nova Senha (deixe em branco para manter a atual)"}
                  </Label>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    value={formData.senha}
                    onChange={handleInputChange}
                    required={dialogMode === "add"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    required={dialogMode === "add" || formData.senha !== ""}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => handleCheckboxChange("ativo", checked as boolean)}
                  />
                  <Label htmlFor="ativo" className="cursor-pointer">
                    Ativo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="super_admin"
                    checked={formData.super_admin}
                    onCheckedChange={(checked) => handleCheckboxChange("super_admin", checked as boolean)}
                  />
                  <Label htmlFor="super_admin" className="cursor-pointer">
                    Super Administrador
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">{dialogMode === "add" ? "Adicionar" : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
