"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  X,
  User,
  CreditCard,
  FileText
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import QRCode from "qrcode"

interface Payment {
  id: string
  numbers: number[]
  total: number
  status: string
  clientName?: string
  clientCpf?: string
  pixCode?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface Raffle {
  id: string
  title: string
  description: string
}

export default function PaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchPayments()
    }
  }, [params.id])

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/admin/raffles/${params.id}/payments`)
      if (response.ok) {
        const data = await response.json()
        setRaffle(data.raffle)
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPayments() // Refresh data
        setShowApprovalDialog(false)
      }
    } catch (error) {
      console.error("Error approving payment:", error)
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        fetchPayments() // Refresh data
        setShowApprovalDialog(false)
      }
    } catch (error) {
      console.error("Error rejecting payment:", error)
    }
  }

  const generateQRCode = async (pixCode: string) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(pixCode, {
        width: 200,
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
        return "Aprovado"
      case "PENDING":
        return "Aguardando Aprovação"
      case "CANCELLED":
        return "Rejeitado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "CANCELLED":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
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
              onClick={() => router.push(`/admin/raffles/${params.id}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Pagamentos - {raffle.title}</h1>
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
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              {raffle.title}
            </CardTitle>
            <CardDescription>{raffle.description}</CardDescription>
          </CardHeader>
        </Card>

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum pagamento pendente
              </h3>
              <p className="text-gray-600">
                Não há pagamentos aguardando aprovação para esta rifa.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {payments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className="ml-2">Pagamento #{payment.id.slice(-8)}</span>
                      </CardTitle>
                      <CardDescription>
                        Cliente: {payment.clientName || payment.user.name} ({payment.user.email})
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="text-lg font-semibold">{formatCurrency(payment.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Números</p>
                      <p className="text-lg font-semibold">{payment.numbers.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="text-sm font-medium">{formatDate(new Date(payment.createdAt))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CPF</p>
                      <p className="text-sm font-medium">{payment.clientCpf || "Não informado"}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Números da Sorte:</p>
                    <div className="flex flex-wrap gap-1">
                      {payment.numbers.map(number => (
                        <span 
                          key={number}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                        >
                          {number.toString().padStart(3, '0')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {payment.status === "PENDING" && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowApprovalDialog(true)
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprovePayment(payment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectPayment(payment.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Payment Details Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>
              Informações completas do pagamento para análise
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Cliente</h4>
                  <p className="text-sm text-gray-600">{selectedPayment.clientName || selectedPayment.user.name}</p>
                  <p className="text-sm text-gray-600">{selectedPayment.user.email}</p>
                  <p className="text-sm text-gray-600">CPF: {selectedPayment.clientCpf || "Não informado"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pagamento</h4>
                  <p className="text-sm text-gray-600">Valor: {formatCurrency(selectedPayment.total)}</p>
                  <p className="text-sm text-gray-600">Data: {formatDate(new Date(selectedPayment.createdAt))}</p>
                  <p className="text-sm text-gray-600">Status: {getStatusText(selectedPayment.status)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Números da Sorte</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPayment.numbers.map(number => (
                    <span 
                      key={number}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                    >
                      {number.toString().padStart(3, '0')}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPayment.pixCode && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Código PIX</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-mono break-all mb-3">{selectedPayment.pixCode}</p>
                    <div className="text-center">
                      <button
                        onClick={() => generateQRCode(selectedPayment.pixCode!)}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Ver QR Code
                      </button>
                      {qrCodeDataUrl && (
                        <div className="mt-3">
                          <img 
                            src={qrCodeDataUrl} 
                            alt="QR Code PIX" 
                            className="w-32 h-32 mx-auto border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowApprovalDialog(false)}
                >
                  Fechar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprovePayment(selectedPayment.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar Pagamento
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleRejectPayment(selectedPayment.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}