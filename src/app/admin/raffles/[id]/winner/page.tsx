"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Trophy, 
  ArrowLeft, 
  Shuffle,
  CheckCircle,
  AlertTriangle,
  Users
} from "lucide-react"

interface Raffle {
  id: string
  title: string
  description: string
  totalNumbers: number
  soldNumbers: number
  winnerNumber?: number
  winnerId?: string
  status: string
}

interface Winner {
  number: number
  userId: string
  userName: string
  userEmail: string
}

export default function WinnerPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSelecting, setIsSelecting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)
  const [manualNumber, setManualNumber] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchRaffleData()
    }
  }, [params.id])

  const fetchRaffleData = async () => {
    try {
      const response = await fetch(`/api/admin/raffles/${params.id}/winner`)
      if (response.ok) {
        const data = await response.json()
        setRaffle(data.raffle)
        setWinners(data.winners)
      }
    } catch (error) {
      console.error("Error fetching raffle data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRandomSelection = async () => {
    if (winners.length === 0) return

    setIsSelecting(true)
    try {
      const response = await fetch(`/api/admin/raffles/${params.id}/winner/random`, {
        method: "POST"
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedWinner(data.winner)
        setShowConfirmDialog(true)
      }
    } catch (error) {
      console.error("Error selecting random winner:", error)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleManualSelection = () => {
    const number = parseInt(manualNumber)
    const winner = winners.find(w => w.number === number)
    
    if (winner) {
      setSelectedWinner(winner)
      setShowConfirmDialog(true)
    } else {
      alert("Número não encontrado ou não foi vendido")
    }
  }

  const confirmWinner = async () => {
    if (!selectedWinner) return

    try {
      const response = await fetch(`/api/admin/raffles/${params.id}/winner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winnerNumber: selectedWinner.number,
          winnerId: selectedWinner.userId
        }),
      })

      if (response.ok) {
        alert("Vencedor definido com sucesso! A rifa ainda está ativa.")
        router.push(`/admin`)
      }
    } catch (error) {
      console.error("Error confirming winner:", error)
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
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Definir Vencedor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total de números</p>
                <p className="text-lg font-semibold">{raffle.totalNumbers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Números vendidos</p>
                <p className="text-lg font-semibold">{raffle.soldNumbers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Participantes</p>
                <p className="text-lg font-semibold">{winners.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  raffle.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {raffle.status === 'ACTIVE' ? 'Ativa' : 'Finalizada'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {raffle.winnerNumber ? (
          /* Winner Already Selected */
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                Vencedor Já Definido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  Número {raffle.winnerNumber.toString().padStart(3, '0')}
                </div>
                <p className="text-green-700 mb-4">
                  O vencedor desta rifa já foi selecionado. A rifa ainda está ativa.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => {
                      setRaffle({...raffle, winnerNumber: undefined, winnerId: undefined})
                    }}
                    variant="outline"
                  >
                    Redefinir Vencedor
                  </Button>
                  <Button 
                    onClick={() => router.push(`/admin`)}
                    variant="default"
                  >
                    Voltar ao Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Winner Selection */
          <div className="space-y-6">
            {/* Selection Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Random Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shuffle className="h-5 w-5 mr-2 text-blue-500" />
                    Seleção Aleatória
                  </CardTitle>
                  <CardDescription>
                    O sistema escolherá automaticamente um vencedor aleatório
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={handleRandomSelection}
                    disabled={isSelecting || winners.length === 0}
                  >
                    {isSelecting ? "Selecionando..." : "Sortear Vencedor"}
                  </Button>
                  {winners.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Nenhum número foi vendido ainda
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Manual Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-500" />
                    Seleção Manual
                  </CardTitle>
                  <CardDescription>
                    Escolha manualmente o número vencedor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="manualNumber">Número vencedor</Label>
                    <Input
                      id="manualNumber"
                      type="number"
                      min="1"
                      max={raffle.totalNumbers}
                      value={manualNumber}
                      onChange={(e) => setManualNumber(e.target.value)}
                      placeholder="Digite o número"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleManualSelection}
                    disabled={!manualNumber || winners.length === 0}
                  >
                    Definir Vencedor
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Winners List */}
            {winners.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Números Vendidos</CardTitle>
                  <CardDescription>
                    Lista de todos os números vendidos e seus compradores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {winners.map((winner) => (
                      <div 
                        key={winner.number}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-lg">
                              Nº {winner.number.toString().padStart(3, '0')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {winner.userName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {winner.userEmail}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWinner(winner)
                              setShowConfirmDialog(true)
                            }}
                          >
                            Selecionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warning */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Atenção</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Após definir o vencedor, a rifa será automaticamente finalizada e não poderá ser alterada. 
                      Certifique-se de que a seleção está correta antes de confirmar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Vencedor</DialogTitle>
            <DialogDescription>
              Você está prestes a definir o vencedor da rifa "{raffle.title}"
            </DialogDescription>
          </DialogHeader>
          {selectedWinner && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Número {selectedWinner.number.toString().padStart(3, '0')}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{selectedWinner.userName}</h4>
                  <p className="text-gray-600">{selectedWinner.userEmail}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <p className="text-yellow-700 text-sm">
                    Esta ação não pode ser desfeita. A rifa será finalizada após a confirmação.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={confirmWinner}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Vencedor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}