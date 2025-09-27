"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, Users, Gift } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session?.user?.role === "ADMIN") {
      router.push("/admin")
    } else if (session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Rifas da Sorte</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => router.push("/auth/signin")}>
                Entrar
              </Button>
              <Button onClick={() => router.push("/auth/signup")}>
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sua Sorte Está Aqui!
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Participe das melhores rifas online com prêmios incríveis. 
            Sistema seguro, transparente e fácil de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => router.push("/auth/signup")}>
              Começar Agora
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Ver Rifas Ativas
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher a Rifas da Sorte?
            </h3>
            <p className="text-lg text-gray-600">
              Oferecemos a melhor experiência em rifas online
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Prêmios Incríveis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rifas com prêmios de alto valor e grande variedade
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">100% Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sistema totalmente seguro e transparente
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Fácil de Usar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interface intuitiva e processo simples
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Pacotes Promocionais</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Descontos especiais em pacotes de números
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para tentar a sorte?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Cadastre-se agora e comece a participar das melhores rifas
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-4"
            onClick={() => router.push("/auth/signup")}
          >
            Cadastrar Gratuitamente
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
              <h4 className="text-2xl font-bold">Rifas da Sorte</h4>
            </div>
            <p className="text-gray-400">
              © 2024 Rifas da Sorte. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}