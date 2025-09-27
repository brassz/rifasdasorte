"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Trophy,
  AlertCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Purchase {
  id: string
  numbers: number[]
  total: number
  status: string
  createdAt: string
  raffle: {
    id: string
    title: string
    description: string
  }
}

export default function PurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPurchase()
    }
  }, [params.id])

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPurchase(data.purchase)
      }
    } catch (error) {
      console.error("Error fetching purchase:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!purchase) return

    setIsProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch(`/api/purchases/${purchase.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: "credit_card",
          amount: purchase.total
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPurchase(data.purchase)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pago"
      case "PENDING":
        return "Aguardando Pagamento"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "CANCELLED":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Compra não encontrada</h1>
          <p className="text-gray-600">A compra que você está procurando não existe.</p>
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
              onClick={() => router.push("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Purchase Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Detalhes da Compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{purchase.raffle.title}</h3>
                  <p className="text-gray-600 text-sm">{purchase.raffle.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Números comprados:</span>
                    <span className="font-medium">{purchase.numbers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Data da compra:</span>
                    <span className="font-medium">
                      {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                      {getStatusText(purchase.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Números da Sorte:</h4>
                  <div className="flex flex-wrap gap-1">
                    {purchase.numbers.map(number => (
                      <span 
                        key={number}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                      >
                        {number.toString().padStart(3, '0')}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(purchase.status)}
                  <span className="ml-2">Status do Pagamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchase.status === "PAID" ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Pagamento Confirmado!
                    </h3>
                    <p className="text-green-600">
                      Sua compra foi processada com sucesso. Boa sorte!
                    </p>
                  </div>
                ) : purchase.status === "PENDING" ? (
                  <div className="text-center py-4">
                    <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                      Aguardando Pagamento
                    </h3>
                    <p className="text-yellow-600 mb-4">
                      Complete o pagamento para confirmar sua compra.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processando..." : "Pagar Agora"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-red-800 mb-2">
                      Pagamento Cancelado
                    </h3>
                    <p className="text-red-600">
                      Esta compra foi cancelada.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Números selecionados:</span>
                    <span className="font-medium">{purchase.numbers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço por número:</span>
                    <span className="font-medium">
                      {formatCurrency(purchase.total / purchase.numbers.length)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(purchase.total)}</span>
                    </div>
                  </div>
                </div>

                {purchase.status === "PENDING" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Informações de Pagamento</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>• Pagamento processado de forma segura</p>
                      <p>• Seus números serão reservados após o pagamento</p>
                      <p>• Você receberá um e-mail de confirmação</p>
                    </div>
                  </div>
                )}

                {purchase.status === "PAID" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Compra Confirmada</h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <p>• Seus números estão reservados</p>
                      <p>• Você receberá notificações sobre a rifa</p>
                      <p>• Boa sorte no sorteio!</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => router.push(`/raffle/${purchase.raffle.id}`)}
                  >
                    Ver Rifa
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    Meu Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}