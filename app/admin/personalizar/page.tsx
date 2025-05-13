"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTema } from "@/hooks/use-tema"
import Link from "next/link"
import { ArrowLeft, Save, Undo } from "lucide-react"

export default function PersonalizarPage() {
  const { tema, atualizarTema } = useTema()
  const [formTema, setFormTema] = useState({
    corPrimaria: tema.corPrimaria,
    corSecundaria: tema.corSecundaria,
    corAcento: tema.corAcento,
    corFundo: tema.corFundo,
    corTexto: tema.corTexto,
    borderRadius: tema.borderRadius,
  })
  const [previewAtivo, setPreviewAtivo] = useState(false)

  useEffect(() => {
    setFormTema({
      corPrimaria: tema.corPrimaria,
      corSecundaria: tema.corSecundaria,
      corAcento: tema.corAcento,
      corFundo: tema.corFundo,
      corTexto: tema.corTexto,
      borderRadius: tema.borderRadius,
    })
  }, [tema])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormTema({
      ...formTema,
      [name]: value,
    })
  }

  const aplicarPreview = () => {
    atualizarTema(formTema)
    setPreviewAtivo(true)
  }

  const salvarTema = () => {
    atualizarTema(formTema)
    setPreviewAtivo(false)
    alert("Tema salvo com sucesso!")
  }

  const resetarTema = () => {
    const temaInicial = {
      corPrimaria: "#f97316", // orange-500
      corSecundaria: "#fb923c", // orange-400
      corAcento: "#ea580c", // orange-600
      corFundo: "#ffffff", // white
      corTexto: "#1f2937", // gray-800
      borderRadius: "0.5rem",
    }

    setFormTema(temaInicial)
    atualizarTema(temaInicial)
    setPreviewAtivo(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold">Personalizar Tema</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Cores e Estilo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="corPrimaria">Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corPrimaria"
                      name="corPrimaria"
                      type="color"
                      value={formTema.corPrimaria}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input type="text" value={formTema.corPrimaria} onChange={handleInputChange} name="corPrimaria" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corSecundaria">Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corSecundaria"
                      name="corSecundaria"
                      type="color"
                      value={formTema.corSecundaria}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formTema.corSecundaria}
                      onChange={handleInputChange}
                      name="corSecundaria"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corAcento">Cor de Destaque</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corAcento"
                      name="corAcento"
                      type="color"
                      value={formTema.corAcento}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input type="text" value={formTema.corAcento} onChange={handleInputChange} name="corAcento" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corFundo">Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corFundo"
                      name="corFundo"
                      type="color"
                      value={formTema.corFundo}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input type="text" value={formTema.corFundo} onChange={handleInputChange} name="corFundo" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corTexto">Cor do Texto</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="corTexto"
                      name="corTexto"
                      type="color"
                      value={formTema.corTexto}
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input type="text" value={formTema.corTexto} onChange={handleInputChange} name="corTexto" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Arredondamento de Bordas</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="borderRadius"
                      name="borderRadius"
                      type="text"
                      value={formTema.borderRadius}
                      onChange={handleInputChange}
                      placeholder="0.5rem"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Use valores como "0.5rem", "8px", "0" (sem arredondamento)</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={aplicarPreview}>Visualizar</Button>
                  <Button variant="default" onClick={salvarTema}>
                    <Save className="h-4 w-4 mr-2" /> Salvar Tema
                  </Button>
                  <Button variant="outline" onClick={resetarTema}>
                    <Undo className="h-4 w-4 mr-2" /> Resetar
                  </Button>
                </div>

                {previewAtivo && (
                  <p className="text-sm text-orange-500 mt-2">
                    Tema aplicado temporariamente. Clique em "Salvar Tema" para confirmar as alterações.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 text-center"
                    style={{ backgroundColor: formTema.corFundo, color: formTema.corTexto }}
                  >
                    <h2 className="text-xl font-bold">Cabeçalho</h2>
                  </div>

                  <div className="p-2" style={{ backgroundColor: formTema.corSecundaria, color: "white" }}>
                    <div className="flex space-x-2">
                      <div className="px-3 py-1 rounded" style={{ backgroundColor: formTema.corPrimaria }}>
                        Categoria 1
                      </div>
                      <div className="px-3 py-1">Categoria 2</div>
                      <div className="px-3 py-1">Categoria 3</div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 border rounded-lg p-3" style={{ borderRadius: formTema.borderRadius }}>
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded mr-3"></div>
                        <div>
                          <h3 className="font-bold" style={{ color: formTema.corTexto }}>
                            Produto Exemplo
                          </h3>
                          <p className="text-sm text-gray-600">Descrição do produto</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">R$ 25,90</span>
                            <button
                              className="px-2 py-1 text-white text-sm rounded"
                              style={{
                                backgroundColor: formTema.corPrimaria,
                                borderRadius: formTema.borderRadius,
                              }}
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: formTema.corPrimaria, borderRadius: "9999px" }}
                    >
                      <span className="text-lg">🛒</span>
                    </div>
                  </div>

                  <div className="p-4 text-white text-center" style={{ backgroundColor: formTema.corAcento }}>
                    <p>Rodapé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
