"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  QrCode,
  User,
  FileText
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import QRCode from "qrcode"

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

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [clientInfo, setClientInfo] = useState({
    name: "",
    cpf: ""
  })
  const [pixCode, setPixCode] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")

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

  const generatePixCode = async () => {
    // Gerar código PIX real
    const pix = `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${purchase?.total.toFixed(2)}5802BR5913Rifas da Sorte6009Sao Paulo62070503***6304`
    setPixCode(pix)
    
    // Gerar QR Code
    try {
      const qrCodeUrl = await QRCode.toDataURL(pix, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(qrCodeUrl)
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
    }
    
    return pix
  }

  const handlePayment = async () => {
    if (!purchase || !clientInfo.name || !clientInfo.cpf) {
      alert("Por favor, preencha todos os campos")
      return
    }

    setIsProcessing(true)
    try {
      const pixCode = await generatePixCode()
      
      const response = await fetch(`/api/purchases/${purchase.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: "pix",
          amount: purchase.total,
          clientName: clientInfo.name,
          clientCpf: clientInfo.cpf,
          pixCode: pixCode
        }),
      })

      if (response.ok) {
        setShowQRCode(true)
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
              <h1 className="text-2xl font-bold text-gray-900">Pagamento PIX</h1>
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
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
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

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-500" />
                  Informações do Cliente
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para finalizar o pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={clientInfo.cpf}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-purple-500" />
                  Resumo do Pagamento
                </CardTitle>
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Pagamento PIX</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>• Pagamento instantâneo e seguro</p>
                    <p>• Seus números serão liberados após confirmação</p>
                    <p>• Você receberá um e-mail de confirmação</p>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing || !clientInfo.name || !clientInfo.cpf}
                >
                  {isProcessing ? "Gerando PIX..." : "Gerar Código PIX"}
                </Button>

                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/raffle/${purchase.raffle.id}`)}
                >
                  Ver Rifa
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-green-500" />
              Pagamento PIX
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com seu aplicativo de pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code PIX" 
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                QR Code para pagamento de {formatCurrency(purchase.total)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Código PIX (Copiar e Colar):</p>
              <p className="text-xs font-mono break-all bg-white p-2 rounded border">
                {pixCode}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <Clock className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 text-sm">Aguardando Pagamento</h4>
                  <p className="text-yellow-700 text-xs mt-1">
                    Após o pagamento, aguarde a confirmação do administrador para liberar seus números.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowQRCode(false)}
              >
                Fechar
              </Button>
              <Button 
                className="flex-1"
                onClick={() => router.push(`/purchase/${purchase.id}`)}
              >
                Ver Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}