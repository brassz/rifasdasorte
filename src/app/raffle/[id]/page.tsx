"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Trophy, 
  ShoppingCart, 
  Gift, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  Users
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Raffle {
  id: string
  title: string
  description: string
  totalNumbers: number
  pricePerNumber: number
  status: string
  soldNumbers: number
  endDate?: string
  image?: string
  packages: Package[]
}

interface Package {
  id: string
  name: string
  description: string
  numbers: number
  price: number
  discount: number
}

interface RaffleNumber {
  number: number
  isSold: boolean
}

export default function RafflePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [numbers, setNumbers] = useState<RaffleNumber[]>([])
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchase, setPurchase] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetchRaffle()
    }
  }, [params.id])

  const fetchRaffle = async () => {
    try {
      const response = await fetch(`/api/raffles/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRaffle(data.raffle)
        setNumbers(data.numbers)
      }
    } catch (error) {
      console.error("Error fetching raffle:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNumberClick = (number: number) => {
    if (numbers.find(n => n.number === number)?.isSold) return

    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number)
      } else {
        return [...prev, number]
      }
    })
  }

  const handlePurchase = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (selectedNumbers.length === 0) return

    setIsPurchasing(true)
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raffleId: raffle?.id,
          numbers: selectedNumbers
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPurchase(data.purchase)
        // Redirect to payment
        router.push(`/purchase/${data.purchase.id}/payment`)
      }
    } catch (error) {
      console.error("Error creating purchase:", error)
    } finally {
      setIsPurchasing(false)
    }
  }

  const getNumberStatus = (number: number) => {
    const raffleNumber = numbers.find(n => n.number === number)
    if (raffleNumber?.isSold) return "sold"
    if (selectedNumbers.includes(number)) return "selected"
    return "available"
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

  const totalPrice = selectedNumbers.length * raffle.pricePerNumber

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">{raffle.title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Raffle Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Informações da Rifa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{raffle.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{raffle.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Números vendidos:</span>
                    <span className="font-medium">
                      {raffle.soldNumbers} / {raffle.totalNumbers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(raffle.soldNumbers / raffle.totalNumbers) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preço por número:</span>
                  <span className="font-medium">{formatCurrency(raffle.pricePerNumber)}</span>
                </div>

                {raffle.endDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Encerra em:</span>
                    <span className="font-medium">{formatDate(new Date(raffle.endDate))}</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    raffle.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {raffle.status === 'ACTIVE' ? 'Ativa' : 'Finalizada'}
                  </span>
                </div>

                {/* Selected Numbers Summary */}
                {selectedNumbers.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Números Selecionados ({selectedNumbers.length})
                    </h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedNumbers.map(number => (
                        <span 
                          key={number}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {number.toString().padStart(3, '0')}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      onClick={() => router.push(`/purchase/${purchase.id}/payment`)}
                      disabled={raffle.status !== 'ACTIVE'}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Finalizar Compra
                    </Button>
                  </div>
                )}

                {/* Packages */}
                {raffle.packages && raffle.packages.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pacotes Promocionais</h4>
                    <div className="space-y-2">
                      {raffle.packages.map(pkg => (
                        <div key={pkg.id} className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-sm">{pkg.name}</h5>
                              <p className="text-xs text-gray-600">{pkg.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{formatCurrency(pkg.price)}</p>
                              {pkg.discount > 0 && (
                                <p className="text-xs text-green-600">{pkg.discount}% OFF</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => router.push(`/raffle/${raffle.id}/packages`)}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Ver Pacotes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Numbers Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Escolha seus números da sorte</CardTitle>
                <CardDescription>
                  Clique nos números disponíveis para selecioná-los
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: raffle.totalNumbers }, (_, i) => i + 1).map(number => {
                    const status = getNumberStatus(number)
                    return (
                      <button
                        key={number}
                        onClick={() => handleNumberClick(number)}
                        disabled={status === "sold"}
                        className={`
                          h-12 w-12 rounded-lg text-sm font-medium transition-colors
                          ${status === "sold" 
                            ? "bg-red-500 text-white cursor-not-allowed" 
                            : status === "selected"
                            ? "bg-blue-600 text-white"
                            : "bg-green-500 text-white hover:bg-green-600"
                          }
                        `}
                      >
                        {number.toString().padStart(3, '0')}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                    <span>Selecionado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span>Vendido</span>
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