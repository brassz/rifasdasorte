"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Plus } from "lucide-react"

export default function NewRafflePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalNumbers: 100,
    pricePerNumber: 5.00,
    startDate: "",
    endDate: "",
    image: ""
  })

  const [packages, setPackages] = useState([
    { name: "", numbers: 0, price: 0, discount: 0 }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "totalNumbers" || name === "pricePerNumber" 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handlePackageChange = (index: number, field: string, value: string | number) => {
    setPackages(prev => prev.map((pkg, i) => 
      i === index ? { ...pkg, [field]: value } : pkg
    ))
  }

  const addPackage = () => {
    setPackages(prev => [...prev, { name: "", numbers: 0, price: 0, discount: 0 }])
  }

  const removePackage = (index: number) => {
    setPackages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/raffles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          packages: packages.filter(pkg => pkg.name && pkg.numbers > 0)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/raffles/${data.raffle.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao criar rifa")
      }
    } catch (error) {
      setError("Erro ao criar rifa")
    } finally {
      setIsLoading(false)
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
            <h1 className="text-2xl font-bold text-gray-900">Nova Rifa</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Preencha as informações principais da rifa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Rifa *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Rifa do iPhone 15"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva os detalhes da rifa, prêmio, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Raffle Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Rifa</CardTitle>
              <CardDescription>
                Defina os parâmetros da rifa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalNumbers">Total de Números *</Label>
                  <Input
                    id="totalNumbers"
                    name="totalNumbers"
                    type="number"
                    min="1"
                    value={formData.totalNumbers}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerNumber">Preço por Número (R$) *</Label>
                  <Input
                    id="pricePerNumber"
                    name="pricePerNumber"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.pricePerNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Encerramento</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pacotes Promocionais</CardTitle>
                  <CardDescription>
                    Crie pacotes com desconto para incentivar compras
                  </CardDescription>
                </div>
                <Button type="button" onClick={addPackage} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pacote
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {packages.map((pkg, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Nome do Pacote</Label>
                    <Input
                      value={pkg.name}
                      onChange={(e) => handlePackageChange(index, "name", e.target.value)}
                      placeholder="Ex: Pacote Família"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade de Números</Label>
                    <Input
                      type="number"
                      min="1"
                      value={pkg.numbers}
                      onChange={(e) => handlePackageChange(index, "numbers", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Total (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(index, "price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={pkg.discount}
                      onChange={(e) => handlePackageChange(index, "discount", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePackage(index)}
                      disabled={packages.length === 1}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Criando..." : "Criar Rifa"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}