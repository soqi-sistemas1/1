"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCarrinho } from "@/hooks/use-carrinho"
import { formatarPreco } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function CarrinhoFlutuante() {
  const { carrinho, total, adicionarItem, removerItem } = useCarrinho()
  const [aberto, setAberto] = useState(false)
  const quantidadeTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0)

  // Fechar o carrinho quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (aberto && !target.closest("#carrinho-flutuante") && !target.closest("#botao-carrinho")) {
        setAberto(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [aberto])

  return (
    <>
      <Button
        id="botao-carrinho"
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 z-50"
        onClick={() => setAberto(!aberto)}
      >
        <ShoppingCart className="h-6 w-6" />
        {quantidadeTotal > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {quantidadeTotal}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            id="carrinho-flutuante"
            className="fixed bottom-24 right-6 w-80 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-xl border-orange-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-3 text-orange-800">Seu Carrinho</h3>
                {carrinho.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Seu carrinho está vazio</p>
                ) : (
                  <div className="space-y-3">
                    {carrinho.map((item) => (
                      <div
                        key={`${item.id}-${item.timestamp}`}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.nome}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantidade} x {formatarPreco(item.preco)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => removerItem(item)}
                          >
                            -
                          </Button>
                          <span className="text-sm mx-1">{item.quantidade}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => adicionarItem(item)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between font-bold pt-2">
                      <span>Total:</span>
                      <span>{formatarPreco(total)}</span>
                    </div>

                    <Button className="w-full mt-3 bg-orange-500 hover:bg-orange-600" onClick={() => setAberto(false)}>
                      Ver Pedido Completo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
