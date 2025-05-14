import { type NextRequest, NextResponse } from "next/server"
import { obterBanner, atualizarBanner, excluirBanner } from "@/services/banners"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const banner = await obterBanner(id)

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Erro ao obter banner:", error)
    return NextResponse.json({ error: "Erro ao obter banner" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const dadosBanner = await request.json()
    const bannerAtualizado = await atualizarBanner(id, dadosBanner)

    return NextResponse.json(bannerAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar banner:", error)
    return NextResponse.json({ error: "Erro ao atualizar banner" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    await excluirBanner(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir banner:", error)
    return NextResponse.json({ error: "Erro ao excluir banner" }, { status: 500 })
  }
}
