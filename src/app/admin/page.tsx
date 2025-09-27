"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Trophy, 
  Plus, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  LogOut,
  Settings,
  BarChart3,
  CheckCircle,
  Trash2
} from "lucide-react"
import { signOut } from "next-auth/react"

interface Raffle {
  id: string
  title: string
  description: string
  totalNumbers: number
  pricePerNumber: number
  status: string
  soldNumbers: number
  totalRevenue: number
  createdAt: string
  endDate?: string
  image?: string
  winnerNumber?: number
}

interface Stats {
  totalRaffles: number
  activeRaffles: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "finished">("active")
  const [stats, setStats] = useState<Stats>({
    totalRaffles: 0,
    activeRaffles: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [rafflesResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/raffles"),
        fetch("/api/admin/stats")
      ])

      if (rafflesResponse.ok) {
        const rafflesData = await rafflesResponse.json()
        setRaffles(rafflesData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const getActiveRaffles = () => {
    return raffles.filter(raffle => raffle.status === "ACTIVE")
  }

  const getFinishedRaffles = () => {
    return raffles.filter(raffle => raffle.status === "FINISHED")
  }

  const handleExtendRaffle = async (raffleId: string) => {
    const newEndDate = prompt("Digite a nova data de encerramento (YYYY-MM-DD):")
    if (newEndDate) {
      try {
        const response = await fetch(`/api/admin/raffles/${raffleId}/extend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endDate: newEndDate }),
        })
        
        if (response.ok) {
          fetchData() // Refresh data
        }
      } catch (error) {
        console.error("Error extending raffle:", error)
      }
    }
  }

  const handleFinishRaffle = async (raffleId: string) => {
    if (confirm("Tem certeza que deseja finalizar esta rifa? Esta ação não pode ser desfeita.")) {
      try {
        const response = await fetch(`/api/admin/raffles/${raffleId}/finish`, {
          method: "POST",
        })
        
        if (response.ok) {
          fetchData() // Refresh data
        }
      } catch (error) {
        console.error("Error finishing raffle:", error)
      }
    }
  }

  const handleDeleteRaffle = async (raffleId: string, raffleTitle: string) => {
    const confirmed = confirm(`Tem certeza que deseja APAGAR a rifa "${raffleTitle}"? Esta ação não pode ser desfeita e irá deletar todos os dados relacionados (números, compras, pagamentos).`)
    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/raffles/${raffleId}`, {
          method: "DELETE",
        })
        
        if (response.ok) {
          fetchData() // Refresh data
          alert("Rifa apagada com sucesso!")
        } else {
          const error = await response.json()
          alert(`Erro ao apagar rifa: ${error.error}`)
        }
      } catch (error) {
        console.error("Error deleting raffle:", error)
        alert("Erro ao apagar rifa. Tente novamente.")
      }
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {session?.user?.name}</span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Rifas
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRaffles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeRaffles} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                De todas as rifas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rifas Ativas
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRaffles}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rifas</h2>
          <div className="flex space-x-2">
            <Button onClick={() => router.push("/admin/raffles/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Rifa
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Trophy className="h-4 w-4 inline mr-2" />
            Rifas Ativas ({getActiveRaffles().length})
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "finished"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Rifas Finalizadas ({getFinishedRaffles().length})
          </button>
        </div>

        {/* Raffles List */}
        {raffles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma rifa criada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando sua primeira rifa!
              </p>
              <Button onClick={() => router.push("/admin/raffles/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Rifa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {(activeTab === "active" ? getActiveRaffles() : getFinishedRaffles()).map((raffle) => (
              <Card key={raffle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        {raffle.title}
                        {raffle.image && (
                          <img 
                            src={raffle.image} 
                            alt={raffle.title}
                            className="w-12 h-12 rounded-lg ml-3 object-cover"
                          />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">{raffle.description}</CardDescription>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>Criada em: {new Date(raffle.createdAt).toLocaleDateString('pt-BR')}</span>
                        {raffle.endDate && (
                          <span className="ml-4">
                            Encerra em: {new Date(raffle.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(raffle.status)}`}>
                      {getStatusText(raffle.status, !!raffle.winnerNumber)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Números vendidos</p>
                      <p className="text-lg font-semibold">
                        {raffle.soldNumbers} / {raffle.totalNumbers}
                      </p>
                      <p className="text-xs text-gray-500">
                        {raffle.totalNumbers - raffle.soldNumbers} disponíveis
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preço por número</p>
                      <p className="text-lg font-semibold">
                        R$ {raffle.pricePerNumber.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Receita total</p>
                      <p className="text-lg font-semibold">
                        R$ {raffle.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progresso</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(raffle.soldNumbers / raffle.totalNumbers) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {((raffle.soldNumbers / raffle.totalNumbers) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/raffles/${raffle.id}`)}
                    >
                      Gerenciar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/raffles/${raffle.id}/edit`)}
                    >
                      Editar
                    </Button>
                    {raffle.status === "ACTIVE" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/admin/raffles/${raffle.id}/winner`)}
                        >
                          {raffle.winnerNumber ? "Ver Vencedor" : "Definir Vencedor"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExtendRaffle(raffle.id)}
                        >
                          Estender Rifa
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleFinishRaffle(raffle.id)}
                        >
                          Finalizar Rifa
                        </Button>
                      </>
                    )}
                    {raffle.status === "FINISHED" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/raffles/${raffle.id}/winner`)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {raffle.winnerNumber ? "Ver Vencedor" : "Verificar Vencedor"}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/raffles/${raffle.id}/payments`)}
                    >
                      Pagamentos
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteRaffle(raffle.id, raffle.title)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Apagar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}