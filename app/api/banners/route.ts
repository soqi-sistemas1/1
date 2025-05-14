import { type NextRequest, NextResponse } from "next/server"
import { listarBanners, criarBanner } from "@/services/banners"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const apenasAtivos = searchParams.get("ativos") !== "false"

    const banners = await listarBanners(apenasAtivos)

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Erro ao listar banners:", error)
    return NextResponse.json({ error: "Erro ao listar banners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const banner = await request.json()
    const novoBanner = await criarBanner(banner)

    return NextResponse.json(novoBanner)
  } catch (error) {
    console.error("Erro ao criar banner:", error)
    return NextResponse.json({ error: "Erro ao criar banner" }, { status: 500 })
  }
}
