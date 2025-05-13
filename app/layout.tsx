import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { CarrinhoProvider } from "@/hooks/use-carrinho"
import { TemaProvider } from "@/hooks/use-tema"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Lanchonete Delícia - Peça seu lanche online",
  description: "Sistema de pedidos online da Lanchonete Delícia",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TemaProvider>
            <CarrinhoProvider>
              {children}
              <Toaster />
            </CarrinhoProvider>
          </TemaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
