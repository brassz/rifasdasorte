"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Users, DollarSign, Calendar, Settings, CreditCard, Gift, Award } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Raffle {
  id: string
  title: string
  description: string
  image?: string
  totalNumbers: number
  pricePerNumber: number
  startDate?: string
  endDate?: string
  status: string
  winnerNumber?: number
  winnerId?: string
  createdAt: string
  soldNumbers: number
  totalRevenue: number
}

export default function AdminRaffleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }
    if (params.id) {
      fetchRaffle()
    }
  }, [params.id, session, router])

  const fetchRaffle = async () => {
    try {
      const response = await fetch(`/api/admin/raffles`)
      if (response.ok) {
        const raffles = await response.json()
        const currentRaffle = raffles.find((r: Raffle) => r.id === params.id)
        setRaffle(currentRaffle)
      }
    } catch (error) {
      console.error("Error fetching raffle:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "FINISHED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string, hasWinner?: boolean) => {
    switch (status) {
      case "ACTIVE":
        return hasWinner ? "Ativa (Vencedor definido)" : "Ativa"
      case "FINISHED":
        return "Finalizada"
      case "CANCELLED":
        return "Cancelada"
      case "DRAFT":
        return "Rascunho"
      default:
        return status
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
          <Button onClick={() => router.push("/admin")} className="mt-4">
            Voltar ao Admin
          </Button>
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
              onClick={() => router.push("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">{raffle.title}</h1>
              <Badge className={`ml-4 ${getStatusColor(raffle.status)}`}>
                {getStatusText(raffle.status, !!raffle.winnerNumber)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Raffle Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Informações da Rifa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total de números</p>
                    <p className="text-lg font-semibold">{raffle.totalNumbers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Números vendidos</p>
                    <p className="text-lg font-semibold">{raffle.soldNumbers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preço por número</p>
                    <p className="text-lg font-semibold">{formatCurrency(raffle.pricePerNumber)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receita total</p>
                    <p className="text-lg font-semibold">{formatCurrency(raffle.totalRevenue)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Descrição</p>
                  <p className="text-gray-900">{raffle.description || "Sem descrição"}</p>
                </div>
                {raffle.endDate && (
                  <div>
                    <p className="text-sm text-gray-600">Data de término</p>
                    <p className="text-gray-900">{formatDate(raffle.endDate)}</p>
                  </div>
                )}
                {raffle.winnerNumber && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">Vencedor definido</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      Número {raffle.winnerNumber.toString().padStart(3, '0')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/raffles/${raffle.id}/payments`)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gerenciar Pagamentos
                </Button>
                
                {raffle.status === "ACTIVE" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/admin/raffles/${raffle.id}/winner`)}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      {raffle.winnerNumber ? "Ver Vencedor" : "Definir Vencedor"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/raffle/${raffle.id}/packages`)}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Gerenciar Pacotes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de ocupação</span>
                  <span className="font-semibold">
                    {((raffle.soldNumbers / raffle.totalNumbers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Números disponíveis</span>
                  <span className="font-semibold">
                    {raffle.totalNumbers - raffle.soldNumbers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Criada em</span>
                  <span className="font-semibold">
                    {formatDate(raffle.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}