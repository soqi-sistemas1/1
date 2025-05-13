"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface UploadImagemProps {
  imagemAtual?: string
  onImagemSelecionada: (arquivo: File) => void
  altura?: number
  largura?: number
  className?: string
}

export function UploadImagem({
  imagemAtual,
  onImagemSelecionada,
  altura = 200,
  largura = 200,
  className = "",
}: UploadImagemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imagemAtual || null)
  const [arrastando, setArrastando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) {
      processarArquivo(arquivo)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setArrastando(true)
  }

  const handleDragLeave = () => {
    setArrastando(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setArrastando(false)

    const arquivo = e.dataTransfer.files?.[0]
    if (arquivo) {
      processarArquivo(arquivo)
    }
  }

  const processarArquivo = (arquivo: File) => {
    // Verifica se é uma imagem
    if (!arquivo.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    // Cria uma URL para preview
    const url = URL.createObjectURL(arquivo)
    setPreviewUrl(url)

    // Notifica o componente pai
    onImagemSelecionada(arquivo)
  }

  const removerImagem = () => {
    setPreviewUrl(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={inputRef} />

      {previewUrl ? (
        <div className="relative">
          <Image
            src={previewUrl || "/placeholder.svg"}
            alt="Preview"
            width={largura}
            height={altura}
            className="object-cover rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={removerImagem}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Card
          className={`flex flex-col items-center justify-center p-6 border-dashed cursor-pointer ${
            arrastando ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
          style={{ height: altura, width: largura }}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">Clique ou arraste uma imagem</p>
        </Card>
      )}
    </div>
  )
}
