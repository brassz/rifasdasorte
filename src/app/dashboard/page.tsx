"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, ShoppingCart, Gift, LogOut, CheckCircle } from "lucide-react"
import { signOut } from "next-auth/react"

interface Raffle {
  id: string
  title: string
  description: string
  totalNumbers: number
  pricePerNumber: number
  status: string
  soldNumbers: number
  endDate: string
  image?: string
  winnerNumber?: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [activeTab, setActiveTab] = useState<"active" | "finished">("active")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role === "ADMIN") {
      router.push("/admin")
      return
    }

    fetchRaffles()
  }, [session, status, router])

  const fetchRaffles = async () => {
    try {
      const response = await fetch("/api/raffles")
      if (response.ok) {
        const data = await response.json()
        setRaffles(data)
      }
    } catch (error) {
      console.error("Error fetching raffles:", error)
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
              <h1 className="text-2xl font-bold text-gray-900">Rifas da Sorte</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {session?.user?.name}</span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Rifas
          </h2>
          <p className="text-gray-600">
            Escolha uma rifa e participe da sorte!
          </p>
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

        {(activeTab === "active" ? getActiveRaffles() : getFinishedRaffles()).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === "active" ? "Nenhuma rifa ativa" : "Nenhuma rifa finalizada"}
              </h3>
              <p className="text-gray-600">
                {activeTab === "active" 
                  ? "Não há rifas ativas no momento. Volte em breve!"
                  : "Nenhuma rifa foi finalizada ainda."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "active" ? getActiveRaffles() : getFinishedRaffles()).map((raffle) => (
              <Card key={raffle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{raffle.title}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      raffle.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {raffle.status === 'ACTIVE' ? 'Ativa' : 'Finalizada'}
                    </span>
                  </div>
                  <CardDescription>{raffle.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Números vendidos:</span>
                      <span className="font-medium">
                        {raffle.soldNumbers} / {raffle.totalNumbers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço por número:</span>
                      <span className="font-medium">
                        R$ {raffle.pricePerNumber.toFixed(2)}
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
                    <div className="flex space-x-2">
                      {raffle.status === 'ACTIVE' ? (
                        <>
                          <Button 
                            className="flex-1" 
                            onClick={() => router.push(`/raffle/${raffle.id}`)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Participar
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => router.push(`/raffle/${raffle.id}/packages`)}
                          >
                            <Gift className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="flex-1" 
                          onClick={() => router.push(`/raffle/${raffle.id}`)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verificar Vencedor
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rifas Participadas
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Você ainda não participou de nenhuma rifa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Números Comprados
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total de números adquiridos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prêmios Ganhos
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Continue tentando a sorte!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}