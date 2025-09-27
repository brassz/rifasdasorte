"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Trophy, 
  Gift, 
  ArrowLeft, 
  ShoppingCart,
  Percent,
  CheckCircle
} from "lucide-react"
import { formatCurrency, calculatePackageDiscount } from "@/lib/utils"

interface Raffle {
  id: string
  title: string
  description: string
  pricePerNumber: number
  status: string
}

interface Package {
  id: string
  name: string
  description: string
  numbers: number
  price: number
  discount: number
}

export default function PackagesPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPackages()
    }
  }, [params.id])

  const fetchPackages = async () => {
    try {
      const response = await fetch(`/api/raffles/${params.id}/packages`)
      if (response.ok) {
        const data = await response.json()
        setRaffle(data.raffle)
        setPackages(data.packages)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg)
    setShowPurchaseDialog(true)
  }

  const handlePurchase = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (!selectedPackage) return

    setIsPurchasing(true)
    try {
      const response = await fetch("/api/purchases/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raffleId: raffle?.id,
          packageId: selectedPackage.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/purchase/${data.purchase.id}`)
      }
    } catch (error) {
      console.error("Error purchasing package:", error)
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Rifa não encontrada</h1>
          <p className="text-gray-600">A rifa que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/raffle/${params.id}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-purple-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Pacotes Promocionais</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Raffle Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              {raffle.title}
            </CardTitle>
            <CardDescription>{raffle.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preço individual por número:</p>
                <p className="text-lg font-semibold">{formatCurrency(raffle.pricePerNumber)}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                raffle.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {raffle.status === 'ACTIVE' ? 'Ativa' : 'Finalizada'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        {packages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum pacote disponível
              </h3>
              <p className="text-gray-600">
                Esta rifa não possui pacotes promocionais no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const originalPrice = pkg.numbers * raffle.pricePerNumber
              const savings = originalPrice - pkg.price
              const discountPercentage = calculatePackageDiscount(originalPrice, pkg.price)

              return (
                <Card 
                  key={pkg.id} 
                  className={`package-card ${pkg.discount > 20 ? 'featured' : ''} hover:shadow-xl transition-all duration-300`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.discount > 20 && (
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          DESTAQUE
                        </div>
                      )}
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(pkg.price)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(originalPrice)}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Economize {formatCurrency(savings)} ({discountPercentage.toFixed(0)}% OFF)
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Números incluídos:</span>
                        <span className="font-medium">{pkg.numbers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Preço por número:</span>
                        <span className="font-medium">
                          {formatCurrency(pkg.price / pkg.numbers)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Desconto de {pkg.discount}%</span>
                      </div>
                      <div className="flex items-center text-sm text-blue-600">
                        <Percent className="h-4 w-4 mr-1" />
                        <span>Melhor oferta disponível</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handlePackageSelect(pkg)}
                      disabled={raffle.status !== 'ACTIVE'}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Comprar Pacote
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Benefits Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Por que comprar pacotes?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Percent className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Descontos Especiais</h3>
                <p className="text-sm text-gray-600">
                  Economize mais comprando múltiplos números em pacotes promocionais
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mais Chances</h3>
                <p className="text-sm text-gray-600">
                  Aumente suas chances de ganhar com mais números da sorte
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Processo Simples</h3>
                <p className="text-sm text-gray-600">
                  Compre vários números de uma vez com apenas um clique
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Compra do Pacote</DialogTitle>
            <DialogDescription>
              Você está prestes a comprar o pacote "{selectedPackage?.name}" da rifa "{raffle.title}"
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedPackage.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Números incluídos:</span>
                    <span className="font-medium">{selectedPackage.numbers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço original:</span>
                    <span className="line-through text-gray-500">
                      {formatCurrency(selectedPackage.numbers * raffle.pricePerNumber)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desconto:</span>
                    <span className="text-green-600 font-medium">
                      {selectedPackage.discount}% OFF
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total a pagar:</span>
                    <span>{formatCurrency(selectedPackage.price)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPurchaseDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? "Processando..." : "Confirmar Compra"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}